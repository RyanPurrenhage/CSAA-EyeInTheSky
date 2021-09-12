import cv2
import numpy as np
import keras
import tensorflow as tf
import os
import imutils
import copy
from keras.preprocessing import image
from os import environ as environ
from tensorflow.keras import layers
from keras.layers import Input
from keras.layers.core import Dropout, Lambda
import matplotlib.pyplot as plt
from PIL import Image as PILImage
from PIL import ImageDraw
import PIL
import time
from sys import getrecursionlimit, setrecursionlimit
import sys
import pathlib
abs_path = str(pathlib.Path(__file__).parent.absolute())
sys.path.append(abs_path)
from inference_keras import keras_load_model
from boundingboxes import make_bounding_boxes


def load_model():
    keras.backend.clear_session()
    abs_path = str(pathlib.Path(__file__).parent.absolute())
    # print(abs_path)
    house_path = abs_path + "/updated_Model_tf"
    land_path = abs_path + "/MyModel_tf_onlygrass"
    # print(house_path, land_path)
    house_model = tf.keras.models.load_model(house_path)
    land_model = keras_load_model(land_path)
    models = []
    models.append(house_model)
    models.append(land_model)
    return models


def main_loop():
    models = load_model()

    # Will main loop handle all drones or one per? I think it should handle all.
    looping = True
    while(looping):
        # if folder isn't empty
            # run bounding boxes on it
            # update existing scores or add new ones
        dir = os.listdir(abs_path + 'img_waiting_room')
        if dir:
            for img in dir:
                score = make_bounding_boxes(abs_path + img)
        else:
            os.wait(0.5)
        # else the folder is empty
            # wait(.5 seconds)
        pass
