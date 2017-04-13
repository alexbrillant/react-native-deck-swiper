## react-native-deck-swiper
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/dwyl/esta/issues)
[![Standard - JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![npm version](https://badge.fury.io/js/react-native-deck-swiper.svg)](https://badge.fury.io/js/react-native-deck-swiper)
## Installation
```
npm install react-native-deck-swiper --save
```
## Preview

![App preview](/animation.gif)

## Props

| Props    | type   | description                                                                                             | required or default                          |
|:----------|:--------|:---------------------------------------------------------------------------------------------------------|----------------------------------|
| cards    | array | array of data for the cards to be rendered | required                         |
| renderCard    | func | function to render the card based on the data | required                         |
| onSwipedAll| func | function to be called when all cards have been swiped | () => {} |
| onSwiped | func | function to be called when a card is swiped. it receives the new card index | (cardIndex) => {} |
| cardIndex | number | cardIndex to start with | 0 |
| infinite | bool | keep swiping indefinitely | false |
| verticalThreshold | number | vertical swipe threshold  | height / 5 |
| horizontalThreshold | number | horizontal swipe threshold  | width / 4 |
| secondCardZoom | number | second card zoom | 0.97 |
| backgroundColor | number | background color for the view containing the cards | '#4FD0E9' |
| marginTop | number | marginTop for the swiper container | 0 |
| outputRotationRange | array | rotation values for the x values in inputRotationRange |  ["-10deg", "0deg", "10deg"] |
| inputRotationRange | array | x values range for the rotation output | [-width / 2, 0, width / 2] |
| cardTopMargin | number | card top margin | 60 |
|cardLeftMargin | number | card left margin | 20 |
| animateOpacity| bool | animate opacity | false |
| inputOpacityRangeX | array | pan x opacity input range | [-width / 2, -width / 3, 0, width / 3, width / 2] |
| outputOpacityRangeX | array | opacity values for the values in inputOpacityRange | [0.8, 1, 1, 1, 0.8] |
| inputOpacityRangeY | array | pan y opacity input range | [-height / 2, -height / 3, 0, height / 3, height / 2]
| outputOpacityRangeY | array | opacity values for the values in inputOpacityRange | [0.8, 1, 1, 1, 0.8] |

## Usage example

```javascript
render () {
    <View style={styles.container}>
        <Swiper
            cards={['DO', 'MORE', 'OF', 'WHAT', 'MAKES', 'YOU', 'HAPPY']}
            renderCard={(card) => {
                return (
                    <View style={styles.card}>
                        <Text style={styles.text}>{card}</Text>
                    </View>
                )
            }}
            onSwiped={(cardIndex) => {console.log(cardIndex)}}
            onSwipedAll={() => {console.log('onSwipedAll')}}
            cardIndex={0}
            backgroundColor={'#4FD0E9'}
        />
    </View>
}
```

## Stylesheet example

```javascript

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF'
  },
  card: {
    flex: 1,
    alignSelf: 'stretch',
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#E8E8E8',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  text: {
    textAlign: 'center',
    fontSize: 50,
    backgroundColor: 'transparent'
  }
})
```
## Todo(contributions are welcome)

Underlaying card offset to achieve a stack effect
