import React, { Component } from "react";
import Swiper from "react-native-deck-swiper";
import { StyleSheet, View, Text, Image, Button } from "react-native";

export default class Exemple extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cards: ["1", "2", "3"],
      swipedAllCards: false,
      swipeDirection: "",
      isSwipingBack: false,
      cardIndex: 0
    };
  }

  renderCard = card => {
    return (
      <View style={styles.card}>
        <Text style={styles.text}>{card}</Text>
      </View>
    );
  };

  onSwipedAllCards = () => {
    this.setState({
      swipedAllCards: true
    });
  };

  swipeBack = () => {
    if (!this.state.isSwipingBack) {
      this.setIsSwipingBack(true, () => {
        this.swiper.swipeBack(() => {
          this.setIsSwipingBack(false);
        });
      });
    }
  };

  setIsSwipingBack = (isSwipingBack, cb) => {
    this.setState(
      {
        isSwipingBack: isSwipingBack
      },
      cb
    );
  };

  jumpTo = () => {
    this.swiper.jumpToCardIndex(2);
  };

  render() {
    return (
      <View style={styles.container}>
        <Swiper
          ref={swiper => {
            this.swiper = swiper;
          }}
          onSwiped={this.onSwiped}
          cards={this.state.cards}
          cardIndex={this.state.cardIndex}
          cardVerticalMargin={80}
          renderCard={this.renderCard}
          onSwipedAll={this.onSwipedAllCards}
        >
          <Button onPress={this.swipeBack} title="Swipe Back" />
          <Button onPress={this.jumpTo} title="Jump to last index" />
        </Swiper>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  box1: {
    flex: 1
  },
  container: {
    flex: 1,
    backgroundColor: "#F5FCFF"
  },
  card: {
    flex: 1,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#E8E8E8",
    justifyContent: "center",
    backgroundColor: "white"
  },
  text: {
    textAlign: "center",
    fontSize: 50,
    backgroundColor: "transparent"
  },
  done: {
    textAlign: "center",
    fontSize: 30,
    color: "white",
    backgroundColor: "transparent"
  }
});
