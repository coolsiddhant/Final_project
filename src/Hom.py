import glob 
import cv2
import os
import numpy as np
from matplotlib import pyplot as plt
import tensorflow as tf
import segmentation_models as sm

from tensorflow import keras
import keras,os
from keras.models import Sequential
from keras.layers import Conv2D, MaxPool2D, Flatten, Dense
from keras.preprocessing.image import ImageDataGenerator

from flask import Flask , render_template , request , redirect, url_for
from werkzeug.utils import secure_filename
from gevent.pywsgi import WSGIserver


app= Flask(__name__)
MODEL_PATH='model/MA_Segmentation1.h5'
model=load_model(MODEL_PATH)
model._make_predict_function()

#from keras.applications.resnet50 import Resnet50
#model=ResNet50(weight='imagenet')
#model.save('')

print('MODEL LOADED: CLICK- http://127.0.0.1:5000/')

SIZE_X = 128 #Resize images (height  = X, width = Y) we need to resize it as dimension of data is very 
SIZE_Y = 128   #high and thus it will take a lot of time to work the model.

def model_predict(img_path,model):

    #loading image from image path
    test_img = cv2.imread(img_path, cv2.IMREAD_COLOR)       
    test_img = cv2.resize(test_img, (SIZE_Y, SIZE_X))
    test_img = cv2.cvtColor(test_img, cv2.COLOR_RGB2BGR)

    test_img = np.expand_dims(test_img, axis=0)

    #predicting model
    pred=model.predict(test_img)
    prediction_image = pred.reshape(test_img.shape)
    return prediction_image

@app.route("/", methods= ["GET"] )
def App():
    return render_template("App.jsx")



@app.route('./predict',methods=['GET','POST'])
def upload():
    if request.method=='POST':
        #saving the picture
        f=request.files('file')
        basepath=os.path.dirname(__file__)
        file_path=os.path.join(basepath,'upload',secure_filename(f.filename))
        f.save(file_path)
        #predicting the model
        pred=model_predict(file_path,model)
        #converting it back into string
        pred_class=decode_predictions(pred,top=1)
        result=str(pred_class[0][0][1])
        return result
    return None

if __name__=="__main__":
    app.run(debug=True)