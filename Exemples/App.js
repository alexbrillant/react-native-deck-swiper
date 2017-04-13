import React, { Component } from 'react'
import Swiper from 'react-native-deck-swiper'
import {
  StyleSheet,
  View,
  Text,
  Button
} from 'react-native'

export default class Exemple extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cards:  ['1', '2', '3'],
      swipedAllCards: false
    }
  }

  renderCard = (card) => {
    return (
      <View style={styles.card}>
        <Text style={styles.text}>{card}</Text>
      </View>
    )
  }

  onSwipedAllCards = () => {
    this.setState({
      swipedAllCards: true
    })
  }

  render () {
    return (
      <View style={styles.container}>
        <Button title="Hello World" onPress={()=>{}}>Hello World</Button>
        <Swiper
          cards={this.state.cards}
          renderCard={this.renderCard}
          onSwipedAll={this.onSwipedAllCards}
        />
        {
          this.state.swipedAllCards &&
          <Text style={styles.done}>Lesson done!</Text>
        }
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF'
  },
  card: {
    flex: 1,
    alignSelf: 'stretch',
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#E8E8E8',
    justifyContent: 'center',
    backgroundColor: 'white'
  },
  text: {
    textAlign: 'center',
    fontSize: 50,
    backgroundColor: 'transparent'
  },
  done: {
    textAlign: 'center',
    fontSize: 30,
    color: 'white',
    backgroundColor: 'transparent'
  }
})
