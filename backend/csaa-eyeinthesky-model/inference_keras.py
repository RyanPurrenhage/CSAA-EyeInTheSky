from keras.models import load_model
from PIL import Image
import numpy as np
import math
from keras import models
import os
import tensorflow as tf
import sys
import pathlib
abs_path = str(pathlib.Path(__file__).parent.absolute())
sys.path.append(abs_path)
from util_keras import FBeta

from config import train_ids, test_ids, val_ids, LABELMAP_RGB

def category2mask(img):
    """ Convert a category image to color mask """
    if len(img) == 3:
        if img.shape[2] == 3:
            img = img[:, :, 0]

    mask = np.zeros(img.shape[:2] + (3, ), dtype='uint8')

    for category, mask_color in LABELMAP_RGB.items():
        locs = np.where(img == category)
        mask[locs] = mask_color

    return mask

def chips_from_image(img, size=300):
    shape = img.shape

    chip_count = math.ceil(shape[1] / size) * math.ceil(shape[0] / size)

    chips = []
    for x in range(0, shape[1], size):
        for y in range(0, shape[0], size):
            chip = img[y:y+size, x:x+size, :]
            y_pad = size - chip.shape[0]
            x_pad = size - chip.shape[1]
            chip = np.pad(chip, [(0, y_pad), (0, x_pad), (0, 0)], mode='constant')
            chips.append((chip, x, y))
    return chips

def run_inference_on_file(imagefile, predsfile, model, size=300):
    with Image.open(imagefile).convert('RGB') as img:
        nimg = np.array(Image.open(imagefile).convert('RGB'))
        shape = nimg.shape
        chips = chips_from_image(nimg)

    chips = [(chip, xi, yi) for chip, xi, yi in chips if chip.sum() > 0]
    prediction = np.zeros(shape[:2], dtype='uint8')
    chip_preds = model.predict(np.array([chip for chip, _, _ in chips]), verbose=True)

    for (chip, x, y), pred in zip(chips, chip_preds):
        category_chip = np.argmax(pred, axis=-1) + 1
        section = prediction[y:y+size, x:x+size].shape
        prediction[y:y+size, x:x+size] = category_chip[:section[0], :section[1]]

    mask = category2mask(prediction)
    Image.fromarray(mask).save(abs_path + "/ddinferenceimg.png")
    return mask

# def run_inference(dataset, model=None, model_path=None, basedir='predictions'):
#     if not os.path.isdir(basedir):
#         os.mkdir(basedir)
#     if model is None and model_path is None:
#         raise Exception("model or model_path required")
#
#     if model is None:
#         model = models.load_model(model_path)
#
#     for scene in train_ids + val_ids + test_ids:
#         imagefile = f'{dataset}/images/{scene}-ortho.tif'
#         predsfile = os.path.join(basedir, f'{scene}-prediction.png')
#
#         if not os.path.exists(imagefile):
#             continue
#
#         print(f'running inference on image {imagefile}.')


def keras_load_model(path):
    dependencies = {
        "FBeta": FBeta,
        "tf": tf
    }
    return load_model(path, custom_objects=dependencies)


def inference(path, model):
    dependencies = {
        "FBeta": FBeta,
        "tf": tf
    }

    # img = np.load("1img.npy")
    # index = np.random.randint(0, img.shape[0])
    # x_rand = img[index, :, :, :]
    # i = Image.fromarray(x_rand)
    # i.save('ddtest_img.jpg')

    # model = load_model(abs_path + "/MyModel_tf", custom_objects=dependencies)
    return run_inference_on_file(path, "predfile", model)


# Get a random image from the numpy data set.
def get_random_image():

    img = np.load(abs_path + "1img.npy")
    index = np.random.randint(0, img.shape[0])
    x_rand = img[index, :, :, :]
    i = Image.fromarray(x_rand)
    path = abs_path + 'ddtest_img.jpg'
    i.save(path)
    return path
