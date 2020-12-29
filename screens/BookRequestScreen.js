import React, { Component } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  TouchableHighlight,
  Alert,
  Image,
} from "react-native";
import db from "../config";
import firebase from "firebase";
import { RFValue } from "react-native-responsive-fontsize";
import { SearchBar, ListItem, Input } from "react-native-elements";

import MyHeader from "../components/MyHeader";
//import { BookSearch } from "react-native-google-books";

export default class BookRequestScreen extends Component {
  constructor() {
    super();
    this.state = {
      userId: firebase.auth().currentUser.email,
      petName: "",
      reasonToRequest: "",
      IspetRequestActive: "",
      requestedpetName: "",
      petStatus: "",
      requestId: "",
      userDocId: "",
      docId: "",
      //Imagelink: "#",
      dataSource: "",
      requestedImageLink: "",
      showFlatlist: false,
    };
  }

  createUniqueId() {
    return Math.random().toString(36).substring(7);
  }

  addRequest = async (petName, reasonToRequest) => {
    var userId = this.state.userId;
    var randomRequestId = this.createUniqueId();
   // var pets = await petSearch.searchpet(
     // petName,
      //"AIzaSyASyOjOtJla-X-b3io2eLoaUc_bIRFSIIc"
   // );


    db.collection("requested_pets").add({
      user_id: userId,
      pet_name: petName,
      reason_to_request: reasonToRequest,
      request_id: randomRequestId,
      pet_status: "requested",
      date: firebase.firestore.FieldValue.serverTimestamp(),
      //image_link: pets.data[0].volumeInfo.imageLinks.thumbnail,
    });

    await this.getpetsRequest();
    db.collection("users")
      .where("email_id", "==", userId)
      .get()
      .then()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          db.collection("users").doc(doc.id).update({
            IsPetRequestActive: true,
          });
        });
      });

    this.setState({
      petName: "",
      reasonToRequest: "",
      requestId: randomRequestId,
    });

    return Alert.alert("Pet Requested Successfully");
  };

  receivedpets = (petName) => {
    var userId = this.state.userId;
    var requestId = this.state.requestId;
    db.collection("received_pets").add({
      user_id: userId,
     pet_name: petName,
      request_id: requestId,
      petStatus: "received",
    });
  };

  getIspetRequestActive() {
    db.collection("users")
      .where("email_id", "==", this.state.userId)
      .onSnapshot((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          this.setState({
            IspetRequestActive: doc.data().IspetRequestActive,
            userDocId: doc.id,
          });
        });
      });
  }

  getpetRequest = () => {
    // getting the requested pet
    var petRequest = db
      .collection("requested_pets")
      .where("user_id", "==", this.state.userId)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          if (doc.data().pet_status !== "received") {
            this.setState({
              requestId: doc.data().request_id,
              requestedpetName: doc.data().pet_name,
              petStatus: doc.data().pet_status,
              //requestedImageLink: doc.data().image_link,
              docId: doc.id,
            });
          }
        });
      });
  };

  sendNotification = () => {
    //to get the first name and last name
    db.collection("users")
      .where("email_id", "==", this.state.userId)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          var name = doc.data().first_name;
          var lastName = doc.data().last_name;

          // to get the donor id and pet nam
          db.collection("all_notifications")
            .where("request_id", "==", this.state.requestId)
            .get()
            .then((snapshot) => {
              snapshot.forEach((doc) => {
                var donorId = doc.data().donor_id;
                var petName = doc.data().pet_name;

                //targert user id is the donor id to send notification to the user
                db.collection("all_notifications").add({
                  targeted_user_id: donorId,
                  message:
                    name + " " + lastName + " received the pet " + petName,
                  notification_status: "unread",
                  pet_name: petName,
                });
              });
            });
        });
      });
  };

  componentDidMount() {
    this.getpetRequest();
    this.getIspetRequestActive();
  }

  updatepetRequestStatus = () => {
    //updating the pet status after receiving the pet
    db.collection("requested_pets").doc(this.state.docId).update({
      pet_status: "received",
    });

    //getting the  doc id to update the users doc
    db.collection("users")
      .where("email_id", "==", this.state.userId)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          //updating the doc
          db.collection("users").doc(doc.id).update({
            IspetRequestActive: false,
          });
        });
      });
  };

  async getpetsFromApi(petName) {
    this.setState({ petName: petName });
    if (petName.length > 2) {
      var pets = await petSearch.searchpet(
        petName,
        "AIzaSyASyOjOtJla-X-b3io2eLoaUc_bIRFSIIc"
      );
      this.setState({
        dataSource: pets.data,
        showFlatlist: true,
      });
    }
  }

  //render Items  functionto render the pets from api
  renderItem = ({ item, i }) => {


    let obj = {
      title: item.volumeInfo.title,
      selfLink: item.selfLink,
      buyLink: item.saleInfo.buyLink,
      imageLink: item.volumeInfo.imageLinks,
    };

    return (
      <TouchableHighlight
        style={styles.touchableopacity}
        activeOpacity={0.6}
        underlayColor="#DDDDDD"
        onPress={() => {
          this.setState({
            showFlatlist: false,
            petName: item.volumeInfo.title,
          });
        }}
        bottomDivider
      >
        <Text> {item.volumeInfo.title} </Text>
      </TouchableHighlight>
    );
  };

  render() {
    if (this.state.IspetRequestActive === true) {
      return (
        <View style={{ flex: 1}}>
          <View
            style={{
              flex: 0.1,
            }}
          >
            <MyHeader title="pet Status" navigation={this.props.navigation} />
          </View>
          <View
            style={styles.ImageView}
          >
            <Image
              source={{ uri: this.state.requestedImageLink }}
              style={styles.imageStyle}
            />
          </View>
          <View
            style={styles.petstatus}
          >
            <Text
              style={{
                fontSize: RFValue(20),

              }}
            >
              Name of the pet
            </Text>
            <Text
              style={styles.requestedpetName}
            >
              {this.state.requestedpetName}
            </Text>
            <Text
              style={styles.status}
            >
              Status
            </Text>
            <Text
              style={styles.petStatus}
            >
              {this.state.petStatus}
            </Text>
          </View>
          <View
            style={styles.buttonView}
          >
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                this.sendNotification();
                this.updatepetRequestStatus();
                this.receivedpets(this.state.requestedpetName);
              }}
            >
              <Text
                style={styles.buttontxt}
              >
                Pet Received
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    return (
      <View style={{ flex: 1 }}>
        <View style={{ flex: 0.1 }}>
          <MyHeader title="Request pet" navigation={this.props.navigation} />
        </View>
        <View style={{ flex: 0.9 }}>
          <Input
            style={styles.formTextInput}
            label={"pet Name"}
            placeholder={"pet name"}
            containerStyle={{ marginTop: RFValue(60) }}
            onChangeText={(text) => this.getpetsFromApi(text)}
            onClear={(text) => this.getpetsFromApi("")}
            value={this.state.petName}
          />
          {this.state.showFlatlist ? (
            <FlatList
              data={this.state.dataSource}
              renderItem={this.renderItem}
              enableEmptySections={true}
              style={{ marginTop: RFValue(10) }}
              keyExtractor={(item, index) => index.toString()}
            />
          ) : (
            <View style={{ alignItems: "center" }}>
              <Input
                style={styles.formTextInput}
                containerStyle={{ marginTop: RFValue(30) }}
                multiline
                numberOfLines={8}
                label={"Reason"}
                placeholder={"Why do you need the pet"}
                onChangeText={(text) => {
                  this.setState({
                    reasonToRequest: text,
                  });
                }}
                value={this.state.reasonToRequest}
              />
              <TouchableOpacity
                style={[styles.button, { marginTop: RFValue(30) }]}
                onPress={() => {
                  this.addRequest(
                    this.state.petName,
                    this.state.reasonToRequest
                  );
                }}
              >
                <Text
                  style={styles.requestbuttontxt}
                >
                  Request
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  keyBoardStyle: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  formTextInput: {
    width: "75%",
    height: RFValue(35),
    borderWidth: 1,
    padding: 10,
  },
  ImageView:{
    flex: 0.3,
    justifyContent: "center",
    alignItems: "center",
    marginTop:20
  },
  imageStyle:{
    height: RFValue(150),
    width: RFValue(150),
    alignSelf: "center",
    borderWidth: 5,
    borderRadius: RFValue(10),
  },
  petstatus:{
    flex: 0.4,
    alignItems: "center",

  },
  requestedpetName:{
    fontSize: RFValue(30),
    fontWeight: "500",
    padding: RFValue(10),
    fontWeight: "bold",
    alignItems:'center',
    marginLeft:RFValue(60)
  },
  status:{
    fontSize: RFValue(20),
    marginTop: RFValue(30),
  },
  petStatus:{
    fontSize: RFValue(30),
    fontWeight: "bold",
    marginTop: RFValue(10),
  },
  buttonView:{
    flex: 0.2,
    justifyContent: "center",
    alignItems: "center",
  },
  buttontxt:{
    fontSize: RFValue(18),
    fontWeight: "bold",
    color: "#fff",
  },
  touchableopacity:{
    alignItems: "center",
    backgroundColor: "#DDDDDD",
    padding: 10,
    width: "90%",
  },
  requestbuttontxt:{
    fontSize: RFValue(20),
    fontWeight: "bold",
    color: "#fff",
  },
  button: {
    width: "75%",
    height: RFValue(60),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: RFValue(50),
    backgroundColor: "#32867d",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 16,
  },
});
