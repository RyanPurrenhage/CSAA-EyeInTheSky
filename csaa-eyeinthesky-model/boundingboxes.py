import cv2
import numpy as np
import keras
import tensorflow as tf
import matplotlib.pyplot as plt
from PIL import Image as PILImage
import time
import sys
import pathlib
import math
import imutils

abs_path = str(pathlib.Path(__file__).parent.absolute())
sys.path.append(abs_path)
from inference_keras import inference, get_random_image, keras_load_model


def main():
    # print(abs_path)
    path = str(abs_path) + "/modeltest/3779 W 30th Ave.png"
    start_time = time.time()
    # path = get_random_image()
    house_model = tf.keras.models.load_model(abs_path + "/modeltest/final_model2")
    veggie_model = keras_load_model(abs_path + "/MyModel_tf_onlygrass")
    models = [house_model, veggie_model]
    score = make_bounding_boxes(path, models)
    end_time = time.time()
    print(end_time - start_time, "seconds")
    print(score)


def check_versions():
    # Prints the versions of the modules used
    print(f"Numpy: {np.__version__}")
    print(f"Tensorflow: {tf.__version__}")
    print(f"Keras: {keras.__version__}")
    print(f"CV2: {cv2.__version__}")
    print(f"PILLOW: {PILImage.__version__}")
    print(f"Imutils: {imutils.__version__}")


def make_predictions_on_models(img_path, models):
    # Define the models
    house_model, veggie_model = models
    # Read the image using PILLoW
    img = PILImage.open(img_path).convert("RGB")
    # Turn the image into a Numpy Array
    np_img = np.asarray(img)
    # Reshape and predict on the images
    np_img = np_img.reshape(1, np_img.shape[0], np_img.shape[1], 3)
    house_mask = house_model.predict(np_img).reshape(np_img.shape[1], np_img.shape[2]) * 256
    # Predict on the Vegetation Model
    veggie_mask = inference(img_path, veggie_model)
    veggie_mask = np.asarray(veggie_mask)
    return house_mask, veggie_mask


def find_contours(final_img, house_mask):

    image_h, image_w, _ = final_img.shape
    bbox_thick = int(0.6 * (image_h + image_w) / 1000)
    if bbox_thick < 1: bbox_thick = 1
    # Detecting Contours and Drawing Bounding Boxes and Perimeter Boxes
    plt.imsave(abs_path + '/modeltest/grayTest.png', house_mask[:, :], cmap='gray')
    im_tilt = cv2.imread(abs_path + '/modeltest/grayTest.png')
    imgray = cv2.cvtColor(im_tilt, cv2.COLOR_BGR2GRAY)

    cv2.imwrite(abs_path + '/modeltest/house_mask_grayscale.png', imgray)
    ret, thresh = cv2.threshold(imgray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)  # threshold value
    cnts, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)  # outlier detect
    return cnts, bbox_thick


def find_closest_contour(cnts, image_center):
    closest_contours = {}
    for cnt in cnts:
        (x, y), radius = cv2.minEnclosingCircle(cnt)
        center = (int(x), int(y))
        dist_from_center = math.dist(center, image_center)
        if dist_from_center > 100:
            continue
        else:
            closest_contours[dist_from_center] = cnt

    sorted_dist = sorted(closest_contours.keys())
    if not sorted_dist:
        return 0
    center_most_houses = [closest_contours[sorted_dist[0]]]
    return center_most_houses


def find_firescore(rendered_perimeters, perimeter, veggie_mask):
    # Defines the bounds that it checks for the Fire Score,
    x = [x for x, y in rendered_perimeters[perimeter]]
    y = [y for x, y in rendered_perimeters[perimeter]]
    x_start = min(x)
    x_end = max(x)
    y_start = min(y)
    y_end = max(y)

    # Makes sure the boundary doesn't go out of bounds
    if y_end > 255:
        y_end = 255
    if x_end > 255:
        x_end = 255

    total_pixels = 0  # The total number of pixels in the perimeter
    number_of_vegetation = 0  # The total number of Vegetation pixels in the perimeter
    number_of_grass = 0  # The total number of Grass pixels in the perimeter
    number_of_unburnable = 0  # The total number of Ground pixels in the perimeter
    number_of_water = 0  # The total number of Water pixels in the perimeter

    for h in range(x_start, x_end):
        for j in range(y_start, y_end):
            pixel = veggie_mask[h, j]
            r1, g1, b1 = pixel
            if (r1, g1, b1) == (255, 0, 255):
                continue
            elif (r1, g1, b1) == (60, 180, 75):  # Vegetation
                number_of_vegetation += 1
            elif (r1, g1, b1) == (255, 255, 255):  # Dirt, Ground and Concrete
                number_of_unburnable += 1
            elif (r1, g1, b1) == (195, 255, 0):  # Grass
                number_of_grass += 1
            elif (r1, g1, b1) == (245, 130, 48):  # Local Water
                number_of_water += 1
            elif (r1, g1, b1) == (230, 25, 75):
                pass
            total_pixels += 1
    perimeter += 1
    if total_pixels == 0:
        score = "0.0"
    else:
        # Score weighted so Vegetation leans it toward high scores and ground and concrete towards the lower end
        score = format(((float(number_of_vegetation) / float(total_pixels)) * 0.9
                        + (float(number_of_grass) / float(total_pixels)) * 0.5
                        + (float(number_of_unburnable) / float(total_pixels)) * 0.10
                        + (float(number_of_water) / float(total_pixels)) * -0.9), '.3f')
        if float(score) < 0:
            score = "0.0"
        if float(score) > 1.0:
            score = "1.0"
    return score


def make_bounding_boxes(img_path, models, debug=False):
    # Make Predictions on the image using the models
    house_mask, veggie_mask = make_predictions_on_models(img_path, models)
    # Load in the image to draw bounding_boxes
    final_img = cv2.imread(img_path)

    image_center = (int(house_mask.shape[0] / 2) , int(house_mask.shape[1] / 2))
    # Create the bounding box
    cnts, bbox_thick = find_contours(final_img, house_mask)
    center_most_houses = find_closest_contour(cnts, image_center)
    if center_most_houses == 0:
        cv2.imwrite('../src/Assets/outputImages/Final_img.png', final_img)
        return 0, img_path
    rendered_contours = []
    rendered_perimeters = []
    for cnt in center_most_houses:
        # Easy way to get an accurate center
        (x, y), radius = cv2.minEnclosingCircle(cnt)
        center = (int(x), int(y))
        # final_img[int(center[1]), int(center[0])] = [0, 255, 0]
        # Skips over the houses on the edge of the image
        dist_from_center = math.dist(center, image_center)
        if dist_from_center > 100:
            continue
        rendered_contours.append(cnt)
        # Create a collection of pixels along the contour
        rect = cv2.minAreaRect(cnt)
        box = cv2.cv.Boxpoints() if imutils.is_cv2() else cv2.boxPoints(rect)
        box = np.int0(box)

        cnt_norm = cnt - [center[0], center[1]]
        scale = 1.3
        cnt_scaled = cnt_norm * scale
        cnt_scaled = cnt_scaled + [center[0], center[1]]
        cnt_scaled = cnt_scaled.astype(np.int32)

        big_rect = cv2.minAreaRect(cnt_scaled)
        big_box = cv2.cv.Boxpoints() if imutils.is_cv2() else cv2.boxPoints(big_rect)
        big_box = np.int0(big_box)

        # Draw the bounding boxes in the final_img
        cv2.drawContours(final_img, [box], 0, (255, 0, 0), bbox_thick)
        cv2.drawContours(final_img, [big_box], 0, (255, 0, 255), bbox_thick)
        # Draw the bounding boxes in the mask
        cv2.drawContours(veggie_mask, [big_box], 0, (255, 0, 255), bbox_thick)
        cv2.fillPoly(veggie_mask, pts=[box], color=(255, 0, 255))

        rendered_perimeters.append(big_box)
    perimeter = 0
    scores = []
    # Loops through the actual Houses closest to the center.
    for cnt in rendered_contours:
        score = find_firescore(rendered_perimeters, perimeter, veggie_mask)
        scores.append(score)

    # Writing the images to the drive.
    final_img_path = '../src/Assets/outputImages/' + 'Final_img.png'
    # cv2.imwrite( img_path, final_img)
    # final_img_path = abs_path + '/modeltest/Finalimg.png'
    # cv2.imwrite( final_img_path, final_img)
    cv2.imwrite( '../src/Assets/outputImages/' + 'Final_img.png', final_img)
    cv2.imwrite( '../src/Assets/outputImages/' + 'Final_mask.png', veggie_mask)

    return score, final_img_path


if __name__ == "__main__":
    main()
