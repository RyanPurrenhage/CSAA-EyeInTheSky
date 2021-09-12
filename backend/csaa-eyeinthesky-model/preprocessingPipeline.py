import os
import sys
import numpy as np
import random
import shutil
import glob
import matplotlib.pyplot as plt
import matplotlib.image as mpimg
from PIL import Image, ImageEnhance

# Step 1
inp_img_dir = "E:/Dev Tools/Eye in the sky datasests/AerialImageDataset/dtrain/images/"
inp_msk_dir = "E:/Dev Tools/Eye in the sky datasests/AerialImageDataset/dtrain/gt/"

out_dir = "E:/Dev Tools/Eye in the sky datasests/Preprocessed data/output_dir"

# Step 2
# File Path settings
# CHANGE THESE BELOW
dataPath = "E:/Dev Tools/Eye in the sky datasests/Preprocessed data/output_dir/images"
dataSavePath = "E:/Dev Tools/Eye in the sky datasests/Preprocessed data/augmentdir/img"
dataEnhancedSavePath = "E:/Dev Tools/Eye in the sky datasests/Preprocessed data/augmentdir/enhanced"
validationDataPath = "E:/Dev Tools/Eye in the sky datasests/Preprocessed data/output_dir/masks"
validationDataSavePath = "E:/Dev Tools/Eye in the sky datasests/Preprocessed data/augmentdir/annote"

keywords = ["rotated", "enhanced"]
folder = os.listdir(dataPath)

# Step 3
path = "E:/Dev Tools/Eye in the sky datasests/Preprocessed data/augmentdir/annote/"
dirsx = os.listdir(path)
dirsx.sort()
x_train=[]

# Program to split the 5000x5000 pixel dataset images into nxn pixes
def dir_create(path):
    if (os.path.exists(path)) and (os.listdir(path) != []):
        shutil.rmtree(path)
        os.makedirs(path)
    if not os.path.exists(path):
        os.makedirs(path)

def crop(input_file, height, width):
    img = Image.open(input_file)
    img_width, img_height = img.size
    for i in range(img_height//height):
        for j in range(img_width//width):
            box = (j*width, i*height, (j+1)*width, (i+1)*height)
            yield img.crop(box)

# Press the green button in the gutter to run the script.
def split(inp_img_dir, inp_msk_dir, out_dir, height, width,
          start_num):
    image_dir = os.path.join(out_dir, 'images')
    mask_dir = os.path.join(out_dir, 'masks')
    dir_create(out_dir)
    dir_create(image_dir)
    dir_create(mask_dir)
    img_list = [f for f in
                os.listdir(inp_img_dir)
                if os.path.isfile(os.path.join(inp_img_dir, f))]
    file_num = 0
    for infile in img_list:
        infile_path = os.path.join(inp_img_dir, infile)
        for k, piece in enumerate(crop(infile_path,
                                       height, width), start_num):
            img = Image.new('RGB', (height, width), 255)
            img.paste(piece)
            img_path = os.path.join(image_dir,
                                    infile.split('.')[0]+ '_'
                                    + str(k).zfill(5) + '.tif')
            img.save(img_path)
        infile_path = os.path.join(inp_msk_dir,
                                   infile.split('.')[0] + '.tif')
        for k, piece in enumerate(crop(infile_path,
                                       height, width), start_num):
            msk = Image.new('RGB', (height, width), 255)
            msk.paste(piece)
            msk_path = os.path.join(mask_dir,
                                    infile.split('.')[0] + '_'
                                    + str(k).zfill(5) + '.png')
            msk.save(msk_path)
        file_num += 1
        sys.stdout.write("\rFile %s was processed." % file_num)
        sys.stdout.flush()

if __name__ == '__main__':

    ## Step 1
    height = 256
    width = 256
    start_num = 1

    input_images_list = glob.glob(inp_img_dir + '/*.tif')
    input_masks_list = glob.glob(inp_msk_dir + '/*.tif')
    split(inp_img_dir, inp_msk_dir, out_dir, height, width, start_num)

    for i, (image_path, mask_path) in enumerate(zip(input_images_list,
                                                    input_masks_list)):
        fig, [ax1, ax2] = plt.subplots(1, 2, figsize=(18, 9))
        image = mpimg.imread(image_path)
        mask = mpimg.imread(mask_path)
        ax1.set_title('Image' + str(i+1))
        # ax1.imshow(image)
        # ax2.imshow(mask)
        ax2.set_title('Mask' + str(i+1))

        ## step 2
        # For rotations: Creates a rotation at 0, 90, 180 and 270
        input_img_paths = sorted(
            [
                os.path.join(dataPath, fname)
                for fname in os.listdir(dataPath)
                if fname.endswith(".tif")
            ]
        )

        print("Number of samples:", len(input_img_paths))

        print("--------------Starting Rotations------------------")
        numberOfRotated = 0
        for image in folder:
            print("iter: ", numberOfRotated, "of", len(input_img_paths))
            val_img = image[:-4]
            val_img = val_img + ".png"
            if "rotated" in image or "enhanced" in image:
                continue
            trainingImage = Image.open(f"{dataPath}/{image}")
            validationImage = Image.open(f"{validationDataPath}/{val_img}")
            angles = [0, 45, 90, 135, 180, 225, 270]
            i = random.choice(angles)
            #for i in range(0, 360, 90):
            # Training Image rotation
            rotatedImage = trainingImage.rotate(i)
            rotatedImage.save(f"{dataSavePath}/{image[:-4]}_rotated_{i}{image[-4:]}")
            # Validation Image rotation
            validationRotatedImage = validationImage.rotate(i)
            validationRotatedImage.save(f"{validationDataSavePath}/{image[:-4]}_rotated_{i}{image[-4:]}")
            numberOfRotated += 1
        # print(f"{numberOfRotated} out of {len(folder)} rotated!")

        print(f"Done! {numberOfRotated * 4} ready to be used!")
        print("-------------------Interlude---------------------")
        print("-------------Starting enhancements---------------")
        # For brightness: Creats a brighter or darker image
        # Important so the list is updated with the new rotations and changes.
        # if we don't want rotations, comment the line below
        folder = os.listdir(dataPath)
        factors = [0.5, .6, .7, .8, .9, 1.00, 1.1, 1.2]

        numberOfEnhanced = 0
        for image in folder:
            if "enhanced" in image:
                continue
            trainingImage = Image.open(open(f"{dataSavePath}/{image}", 'rb'))
            enchancer = ImageEnhance.Brightness(trainingImage)
            factor = random.choice(factors)
            enhanced_image = enchancer.enhance(factor)
            enhanced_image.save(f"{dataEnhancedSavePath}/{image[:-4]}_enhanced_{image[-4:]}")

            numberOfEnhanced += 1
        # print(f"{numberOfEnhanced} out of {len(folder)} enhanced!")

        print(f"Done!{numberOfEnhanced} images ready to be used as training data!")

    ## step 3