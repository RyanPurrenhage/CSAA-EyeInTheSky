from flask import Flask, request, session, jsonify, send_file
from flask_cors import CORS, cross_origin
from flask_session import Session
from flask_wtf.csrf import CSRFProtect, generate_csrf
from pymongo import MongoClient
from bson.json_util import dumps
from bson.objectid import ObjectId
from pymongo.errors import OperationFailure
import sys
import requests
import shutil
import bcrypt
import pathlib
from secrets import token_bytes
from datetime import timedelta, datetime

from faker import Faker
fake = Faker()

# import sys
# import pathlib
# abs_path = str(pathlib.Path(__file__).parent.absolute())
# sys.path.append(abs_path)
# print(abs_path)

# from csaa-eyeinthesky-model.boundingboxes import make_bounding_boxes
# 4705 Bramford Drive, Troy, MI, USA
# 4710 Bramford Drive, Troy, MI, USA

abs_path = str(pathlib.Path(__file__).parent.absolute())
sys.path.append(abs_path + "/csaa-eyeinthesky-model")
from boundingboxes import make_bounding_boxes
from modelLoadPipeline import load_model

app = Flask(__name__)
# cors = CORS(app)
# app.config['CORS_HEADERS'] = 'Content-Type'
# app.secret_key = 
# app.config['PERMANENT_SESSION_LIFETIME'] =  timedelta(minutes=5)
app.config.update(
    DEBUG=True,
    SECRET_KEY=b'O\x83\xd7\xdf \xc2%x\x018\xe9#9R\xe9\xe2\xdc\xd9\x17o\xbdwOjv\xd7\xdf\xe1\x89Br6',
    SESSION_COOKIE_HTTPONLY=True,
    REMEMBER_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
    PERMANENT_SESSION_LIFETIME = timedelta(minutes=60),
)
SESSION_TYPE = 'filesystem'
app.config.from_object(__name__)
Session(app)

csrf = CSRFProtect(app)
cors = CORS(
    app,
    resources={r"*": {"origins": "http://localhost:3000"}},
    expose_headers=["Content-Type", "X-CSRFToken"],
    supports_credentials=True,
)

# ssh -N -f -L 8000:localhost:27017 msustudent@54.144.3.149
client = MongoClient('mongodb://localhost:8000/')
db = client['csaa-eyeinthesky']

# addresses = [
#     ['1509 Hearst Ave',    [37.872430, -122.281870]],
#     ['1515 Hearst Ave',    [37.872480, -122.281530]],
#     ['1412 Delaware St',   [37.872670, -122.283870]],
#     ['1732 California St', [37.873820, -122.280480]],
#     ['2025 McGee Ave',     [37.870150, -122.277230]],
#     ['2230 Grant St',      [37.867350, -122.275230]],
#     ['2226 Martin Luther King Jr Way', [37.86924362182617, -122.27273559570312]],
#     ['2422 Jefferson Ave', [37.86670684814453, -122.27820587158203]],
#     ['2416 McGee Ave', [37.86738204956055, -122.27713775634766]],
#     ['2031 Carleton St', [37.86103820800781, -122.26869201660156 ]], 
#     ['1280 Grand View Dr', [37.85795211791992, -122.23137664794922]],
#     ['47716 Ansel Ct', [37.4795167, -121.918516]],
#     ['791 Hutchinson Rd', [37.9126249, -122.0122725]],
#     ['732 Lisboa Ct', [37.9136002, -122.013569]],
#     ['3020 Bowling Green Dr', [37.910704, -122.005676]],
# ]

addresses = [
    ['1509 Hearst Ave',    [37.87254, -122.28178]],
    ['1515 Hearst Ave',    [37.87264, -122.28139]],
    ['1412 Delaware St',   [37.87279, -122.28387]],
    ['1732 California St', [37.87408, -122.28031]],
    ['2025 McGee Ave',     [37.87046, -122.27724]],
    ['2230 Grant St',      [37.86738, -122.27529]],
    ['2226 Martin Luther King Jr Way', [37.86782, -122.27289]],
    ['2422 Jefferson Ave', [37.86364, -122.27813]],
    ['2416 McGee Ave', [37.86387, -122.27711]],
    ['2031 Carleton St', [37.86132, -122.2682]], 
    ['1280 Grand View Dr', [37.85830, -122.23075]],
    ['47716 Ansel Ct', [37.47955, -121.91847]],
    ['791 Hutchinson Rd', [37.91265, -122.01239]],
    ['732 Lisboa Ct', [37.91372, -122.01371]],
    ['3020 Bowling Green Dr', [37.91070, -122.00567]],
    ['3038 Bowling Green Dr.', [37.91081, -122.00478]],
    ['1012 Burlington Ct.', [37.90873, -122.00564]],
    ['412 Castle Rock Rd.', [37.90824, -122.00663]]
]

'''

user = {
    name: string,
    email: string,
    phone: string,

    address: [string]
    coordinates: {lat: float, lng: float}

    firescore: float,
    confidence: int,
    high_risk: bool,

    last_accessed: string,
    notes: string,

    isvisited: bool
}

'''
    

def insert_customersDB(addresses):
    '''Generate fake customers and insert them into the database'''

    customers = []

    for i in range(len(addresses)):

        customer = dict()

        customer['name']  = fake.name()
        customer['email'] = fake.email()
        customer['phone'] = fake.phone_number()

        customer['address'] = addresses[i][0]
        customer['coordinates'] = {"lat":addresses[i][1][0], "lng":addresses[i][1][1]}
        
        customer['last_accessed'] = ""
        customer['notes'] = fake.paragraph(nb_sentences=3)

        # isvisited = fake.boolean(chance_of_getting_true=75)
        isvisited = False
        customer['isvisited'] = False

        firescore = fake.pyfloat(right_digits=3, positive=True, max_value=1) if isvisited else 0
        customer['firescore']  = firescore
        # customer['confidence'] = fake.pyint(min_value=40, max_value=100) if isvisited else 0
        customer['high_risk'] = True if firescore > 0.6 else False

        customer['photoURL'] = '../src/Assets/outputImages/house-placeholder.png'

        # insert into customer list
        customers.append(customer)

    # insert customers into db
    db['customers'].insert_many(customers)
    # db['customers'].drop()




try:
    client.database_names()
    print('Data Base Connection Established........', file=sys.stderr)

except OperationFailure as err:
    print(f"Data Base Connection failed. Error: {err}", file=sys.stderr)


#
# LOAD MODEL
#

#
# https://towardsdatascience.com/how-to-not-deploy-keras-tensorflow-models-4fa60b487682
#

global models
models = load_model()
print(*models)

@app.route('/load-model')
def loadModel():
    myquery = { "name": "Christopher Brandt" }
    newvalues = { "$set": { "name": "Brian Tang" } }


    db['customers'].update_one(myquery, newvalues)

    return 'Model Loaded!'



@app.route("/api/getcsrf", methods=["GET"])
def get_csrf():
    token = generate_csrf()
    response = jsonify({"detail": "CSRF cookie set"})
    response.headers.set("X-CSRFToken", token)
    return response

@app.route('/')
def hello_world():
    print(fake.name(), file=sys.stderr)
    return "Hello World!!"

@app.route('/insert-drone-locations')
def insert_drone_locationsDB():
    initialLocations = [ {'name': 'Drone 1', 'location': { 'lat': 37.872520, 'lng': -122.272920 }},
        {'name': 'Drone 2', 'location': { 'lat': 37.875490, 'lng': -122.273190 }},
        {'name': 'Drone 3', 'location': { 'lat': 37.861196362405984, 'lng': -122.23582574008294 }},
        {'name': 'Drone 4', 'location': { 'lat': 37.872670, 'lng': -122.283870 }},
        {'name': 'Drone 5', 'location': { 'lat': 37.940350, 'lng': -122.069430 }},
        {'name': 'Drone 6', 'location': { 'lat': 37.930350, 'lng': -122.059430 }},
         
    ]
    db['drones'].insert_many(initialLocations)
    # db['drones'].drop()
    
    return "Drones inserted"

@app.route('/get-drones')
@cross_origin()
def get_drones():
    drones = list(db['drones'].find())
    return dumps(drones) 

@cross_origin()
@app.route('/update-drone', methods=['POST'])
def update_drone():
    print('drone update...')
    print(request.json['droneID'])
    print(request.json['newLocation'])

    myquery = { "_id": ObjectId(request.json['droneID']) }
    newvalues = { "$set": { "location": request.json['newLocation'] } }

    db['drones'].update_one(myquery, newvalues)

    return {'success': True}

@app.route('/insert-user')
def insert_userDB():
    email = 'msu-student@csaa.com'
    password = 'welovefootball!314'

    hashed_pass = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    new_user = {'email': email, 'password': hashed_pass}
    db['users'].insert_one(new_user)

    return 'User inserted!'

@app.route('/get-users')
@cross_origin()
def get_users():
    users = list(db['users'].find())
    return dumps(users)

@app.route('/is-logged-in')
def is_logged_in():
    print("Session here", session)
    return {'status': True} if "email" in session else {'status': False}

@app.route('/login-user', methods=['POST'])
def login_user():

    success = { 'is_logged_in': True }

    print("Token here: ", request)

    email = request.json['email']
    password = request.json['password']

    if "email" in session:
        return success

    user_found = db['users'].find_one({'email': email})

    if user_found:
        email_val  = user_found['email']
        pass_check = user_found['password']

        if bcrypt.checkpw(password.encode('utf-8'), pass_check):
            session['email'] = email_val
            session.permanent = True
            print("Session after login: ", session.sid)
            return success
        else:
            if 'email' in session:
                return success
            return { 'error': 'Wrong password'}

    else:
        return {'error': 'Email not found'}


@app.route('/insert-customers')
@cross_origin()
def insert_customers():
    insert_customersDB(addresses)
    return 'Customers inserted'

@app.route('/get-customers')
@cross_origin()
def get_customers():
    customers = list(db['customers'].find().sort('firescore', -1))
    return dumps(customers)

@cross_origin()
@app.route('/get-current-map-image', methods=['POST'])
def get_map():
    print("In get map: ", file=sys.stderr)
    filename = '../src/Assets/outputImages/' + request.json['name'] + '.png'
    r = requests.get(request.json['url'], stream = True)

    print('COORDINATES: ', request.json['coordinates'])
    # Check if the image was retrieved successfully
    if r.status_code == 200:
        # Set decode_content value to True, otherwise the downloaded image file's size will be zero.
        r.raw.decode_content = True
        
        # Open a local file with wb ( write binary ) permission.
        with open(filename,'wb') as f:
            shutil.copyfileobj(r.raw, f)
            
        print('Image sucessfully Downloaded: ',filename)

        firescore, final_img_path = make_bounding_boxes(filename, models)
        if firescore == 0:
            print("No vegetation or homes detected")
        print("Detection done...")
        print(firescore, filename)
    else:
        print('Image Couldn\'t be retreived')
        return {'error': 'Image could not be retrieved'}
    
    #
    # Update database with image path and firescore
    #

    myquery = { "coordinates": request.json['coordinates']}
    newFirescore = { "$set": { "firescore": firescore } }
    newImgPath= { "$set": { "photoURL": filename } }

    db['customers'].update_one(myquery, newFirescore)
    db['customers'].update_one(myquery, newImgPath)
    db['customers'].update_one(myquery, { "$set": { "isvisited": True } })
    db['customers'].update_one(myquery, { "$set": { "last_accessed": datetime.today().strftime('%Y-%m-%d') } })
    if float(firescore) >= 0.6:
        db['customers'].update_one(myquery, { "$set": { "high_risk": True } })
    else:
        db['customers'].update_one(myquery, { "$set": { "high_risk": False } })

    return { 'firescore': firescore }



@cross_origin()
@app.route('/get-image', methods=['POST'])
def get_image():
    return send_file(request.json['path'], 'image/png')