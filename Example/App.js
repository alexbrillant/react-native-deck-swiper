import React, { Component } from 'react'
import Swiper from 'react-native-deck-swiper'
import { Button, StyleSheet, Text, View } from 'react-native'

// demo purposes only
let fakeFetchIndex = 0

async function fetchCardsAsync() {
  // You would replace this with a call to fetch()
  await new Promise(r => setTimeout(r, 500))
  console.log("Finished data")
  items = []
  for(let i = 0; i < 10; i++, fakeFetchIndex++) {
    items.push("Card " + fakeFetchIndex)
  }
  return items
}

export default class Exemple extends Component {
  constructor (props) {
    super(props)
    this.state = {
      cards: ["Default"],
    }
  }

  renderCard = (card, index) => {
    return (
      <View style={styles.card}>
        <Text style={styles.text}>{card} - {index}</Text>
      </View>
    )
  };

  onSwiped = (type, cardIndex) => {
    console.log(`on swiped ${type}, index ${cardIndex}`)
  }

  onTapCard = (cardIndex) => {
    console.log(`on tap ${cardIndex}`)
    this.swiper.swipeLeft()
  }

  fetchNewCards() {
    fetchCardsAsync().then((items) => {
      this.setState({
        cards: items
      })
    })
  }

  componentDidMount() {
    // Fetch new cards when the app starts
    this.fetchNewCards()
  }

  onSwipedAllCards = () => {
    // Fetch new cards when everything has been swiped
    this.fetchNewCards()
  }

  render () {
    return (
      <View style={styles.container}>
        <Swiper
          ref={swiper => {
            this.swiper = swiper
          }}
          onSwiped={(cardIndex) => this.onSwiped('general', cardIndex)}
          onSwipedLeft={(cardIndex) => this.onSwiped('left', cardIndex)}
          onSwipedRight={(cardIndex) => this.onSwiped('right', cardIndex)}
          onSwipedTop={(cardIndex) => this.onSwiped('top', cardIndex)}
          onSwipedBottom={(cardIndex) => this.onSwiped('bottom', cardIndex)}
          onTapCard={(cardIndex) => this.onTapCard(cardIndex)}
          cards={this.state.cards}
          cardVerticalMargin={80}
          renderCard={this.renderCard}
          onSwipedAll={this.onSwipedAllCards}
          stackSize={3}
          stackSeparation={15}
          overlayLabels={{
            bottom: {
              title: 'BLEAH',
              style: {
                label: {
                  backgroundColor: 'black',
                  borderColor: 'black',
                  color: 'white',
                  borderWidth: 1
                },
                wrapper: {
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }
              }
            },
            left: {
              title: 'NOPE',
              style: {
                label: {
                  backgroundColor: 'black',
                  borderColor: 'black',
                  color: 'white',
                  borderWidth: 1
                },
                wrapper: {
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  justifyContent: 'flex-start',
                  marginTop: 30,
                  marginLeft: -30
                }
              }
            },
            right: {
              title: 'LIKE',
              style: {
                label: {
                  backgroundColor: 'black',
                  borderColor: 'black',
                  color: 'white',
                  borderWidth: 1
                },
                wrapper: {
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  marginTop: 30,
                  marginLeft: 30
                }
              }
            },
            top: {
              title: 'SUPER LIKE',
              style: {
                label: {
                  backgroundColor: 'black',
                  borderColor: 'black',
                  color: 'white',
                  borderWidth: 1
                },
                wrapper: {
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }
              }
            }
          }}
          animateOverlayLabelsOpacity
          animateCardOpacity
          swipeBackCard
        >
          <Button onPress={() => this.swiper.swipeBack()} title='Swipe Back' />
        </Swiper>
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
