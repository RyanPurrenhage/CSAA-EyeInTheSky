from keras.models import load_model
import matplotlib.pyplot as plt
from PIL import Image
import numpy as np
from numpy import asarray
import math

LABELMAP = {
    0 : (255,   0, 255),
    1 : (75,   25, 230),
    2 : (180,  30, 145),
    3 : (75,  180,  60),
    4 : (48,  130, 245),
    5 : (255, 255, 255),
    6 : (200, 130,   0),
}

LABELMAP_RGB = { k: (v[2], v[1], v[0]) for k, v in LABELMAP.items() }

def chips_from_image(img, size=256):
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


def run_inference(imagefile, predsfile, model, size=256):
    with Image.open(imagefile).convert('RGB') as img:
        nimg = np.array(Image.open(imagefile).convert('RGB'))
        shape = nimg.shape
        chips = chips_from_image(nimg, size)

    chips = [(chip, xi, yi) for chip, xi, yi in chips if chip.sum() > 0]
    prediction = np.zeros(shape[:2], dtype='uint8')
    chip_preds = model.predict(np.array([chip for chip, _, _ in chips]), verbose=True)

    for (chip, x, y), pred in zip(chips, chip_preds):
        category_chip = np.argmax(pred, axis=-1) + 1
        section = prediction[y:y+size, x:x+size].shape
        prediction[y:y+size, x:x+size] = category_chip[:section[0], :section[1]]

    mask = category2mask(prediction)
    Image.fromarray(mask).save(predsfile)
    return mask

if __name__ == '__main__':
    model = load_model("testmodel/landcover4.h5")
    # model = load_model("testmodel/Land_cover_Model_tf")
    img = np.load("1img.npy")
    index = np.random.randint(0, img.shape[0])
    x_rand = img[index, :, :, :]
    i = Image.fromarray(x_rand)
    i.save('test_img.jpg')

    run_inference('test_img.jpg', "Landcoverpred.jpg", model, size=256)

def load_land_model(model_path):
    # model = load_model(model_path)
    model = load_model(model_path)
    return model