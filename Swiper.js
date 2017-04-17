import React from 'react'
import {
  PanResponder,
  Slider,
  Text,
  View,
  Dimensions,
  Animated
} from 'react-native'
import styles, { circleSize } from './styles'
const { height, width } = Dimensions.get('window')

class Swiper extends React.Component {
  constructor(props) {
    super(props)
    const cardIndexAtLastIndex = props.cardIndex === props.cards.length - 1
    const secondCardIndex = cardIndexAtLastIndex ? 0 : props.cardIndex + 1
    this.state = {
      pan: new Animated.ValueXY(),
      scale: new Animated.Value(props.secondCardZoom),
      firstCardIndex: props.cardIndex,
      secondCardIndex: secondCardIndex,
      cards: props.cards,
      swipedAllCards: false
    }
  }

  componentWillMount() {
    this._animatedValueX = 0;
    this._animatedValueY = 0;
    this.state.pan.x.addListener((value) => this._animatedValueX = value.value);
    this.state.pan.y.addListener((value) => this._animatedValueY = value.value);
    this.initPanResponder()
  }

  initPanResponder = () => {
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: this.onStartShouldSetPanResponder,
      onMoveShouldSetPanResponder: this.onMoveShouldSetPanResponder,
      onPanResponderGrant: this.onPanResponderGrant,
      onPanResponderMove: Animated.event([
        null,
        { dx: this.state.pan.x, dy: this.state.pan.y }
      ]),
      onPanResponderRelease: this.onPanResponderRelease
    })
  }

  onStartShouldSetPanResponder = (event, gestureState) => {
    return true
  }

  onMoveShouldSetPanResponder = (event, gestureState) => {
    return true
  }

  onPanResponderGrant = (event, gestureState) => {
    let x = this._animatedValueX
    let y = this._animatedValueY
    this.state.pan.setOffset({
      x: x,
      y: y
    })
    this.state.pan.setValue({
      x: 0,
      y: 0
    })
  }

  onPanResponderRelease = (e, gestureState) => {
    const { horizontalThreshold, verticalThreshold } = this.props
    const animatedValueX = Math.abs(this._animatedValueX)
    const animatedValueY = Math.abs(this._animatedValueY)
    const isSwiping = animatedValueX > horizontalThreshold || animatedValueY > verticalThreshold
    if (isSwiping) {
      const onSwipeDirectionCallback = this.getonSwipeDirectionCallback(this._animatedValueX, this._animatedValueY)
      this.swipeCard1(onSwipeDirectionCallback)
      this.zoomCard2()
    } else {
      this.resetCard1()
    }
  }

  getonSwipeDirectionCallback = (animatedValueX, animatedValueY) => {
    const {
      horizontalThreshold,
      verticalThreshold,
      onSwipedLeft,
      onSwipedRight,
      onSwipedTop,
      onSwipedBottom
    } = this.props
    const isSwipingLeft = animatedValueX < -horizontalThreshold
    const isSwipingRight = animatedValueX > horizontalThreshold
    const isSwipingTop = animatedValueY < -verticalThreshold
    const isSwipingBottom = animatedValueY > verticalThreshold
    let onDirectionCallback
    if (isSwipingRight) {
      return onSwipedRight
    } else if (isSwipingLeft) {
      return onSwipedLeft
    } else if (isSwipingTop) {
      return onSwipedTop
    } else if (isSwipingBottom) {
      return onSwipedBottom
    }
  }

  resetCard1 = (cb) => {
    Animated.spring(
      this.state.pan, {
        toValue: 0
      }
    ).start(cb)
  }

  swipeCard1 = (onSwiped) => {
    Animated.timing(
      this.state.pan, {
        toValue: {
          x: this._animatedValueX * 4.5,
          y: this._animatedValueY * 4.5
        },
        duration: 350
      }
    ).start(() => {
      this.incrementCardIndex(onSwiped)
    })
  }

  zoomCard2 = () => {
    Animated.spring(
      this.state.scale, {
        toValue: 1,
        duration: 100,
      }
    ).start()
  }

  incrementCardIndex = (onSwiped) => {
    this.setState((prevState) => {
      let previousCardIndex = prevState.firstCardIndex
      let newCardIndex = prevState.firstCardIndex + 1
      let swipedAllCards = prevState.swipedAllCards

      if (newCardIndex > this.state.cards.length - 1) {
        newCardIndex = 0
        swipedAllCards = true
        this.props.onSwipedAll()
      }

      this.props.onSwiped(previousCardIndex)
      onSwiped(previousCardIndex)

      return {
        ...prevState,
        firstCardIndex: newCardIndex,
        secondCardIndex: newCardIndex === this.props.cards.length - 1 ? 0 : newCardIndex + 1,
        swipedAllCards: swipedAllCards
      }
    }, () => {
      this.state.pan.setValue({ x: 0, y: 0 });
      this.state.scale.setValue(this.props.secondCardZoom);
    })
  }

  componentWillUnmount() {
    this.state.pan.x.removeAllListeners();
    this.state.pan.y.removeAllListeners();
  }

  getCardStyles = () => {
    const { cardTopMargin, cardLeftMargin, marginTop, marginBottom } = this.props
    let cardWidth = width - (cardLeftMargin * 2)
    let cardHeight = height - ((cardTopMargin * 2) + marginTop + marginBottom)
    const cardStyle = {
      top: cardTopMargin,
      left: cardLeftMargin,
      width: cardWidth,
      height: cardHeight,
      position: 'absolute'
    }

    let card1Opacity = this.props.animateOpacity ? this.interpolateOpacity() : 1
    const cardStyle1 = [
      styles.card,
      cardStyle,
      {
        zIndex: 2,
        opacity: card1Opacity,
        transform: [
          {translateX: this.state.pan.x},
          {translateY: this.state.pan.y},
          {rotate: this.interpolateRotation()}
        ]
      }
    ]

    const cardStyle2 = [
      styles.card,
      cardStyle,
      {
        zIndex: 1,
        transform: [
          {scale: this.state.scale}
        ]
      }
    ]

    return [cardStyle1, cardStyle2]
  }

  interpolateOpacity = () => {
    const animatedValueX = Math.abs(this._animatedValueX)
    const animatedValueY = Math.abs(this._animatedValueY)
    let opacity
    if (animatedValueX > animatedValueY) {
      opacity = this.state.pan.x.interpolate({
        inputRange: this.props.inputOpacityRangeX,
        outputRange: this.props.outputOpacityRangeX
      })
    }
    else {
      opacity = this.state.pan.y.interpolate({
        inputRange: this.props.inputOpacityRangeY,
        outputRange: this.props.outputOpacityRangeY
      })
    }
    return opacity
  }

  interpolateRotation = () => {
    return this.state.pan.x.interpolate({
      inputRange: this.props.inputRotationRange,
      outputRange: this.props.outputRotationRange
    })
  }

  render() {
    const style1 = this.getCardStyles()[0]
    const style2 = this.getCardStyles()[1]
    const { cards, firstCardIndex, secondCardIndex } = this.state
    let firstCardContent = cards[firstCardIndex]
    let secondCardContent = cards[secondCardIndex]
    let firstCard = this.props.renderCard(firstCardContent)
    let secondCard = this.props.renderCard(secondCardContent)

    if (!this.props.infinite) {
      if (secondCardIndex === 0) {
        secondCard = null
      }
      if (this.state.swipedAllCards) {
        firstCard = null
        secondCard = null
      }
    }

    return (
      <View style = {
        [styles.container,
          {backgroundColor: this.props.backgroundColor, marginTop: this.props.marginTop, marginBottom: this.props.marginBottom}
        ]}>
        <Animated.View
          style={style1}
          {...this._panResponder.panHandlers}>
          {firstCard}
        </Animated.View>
        <Animated.View
          style={style2}>
          {secondCard}
        </Animated.View>
      </View>
    )
  }
}

Swiper.propTypes = {
  cards: React.PropTypes.array.isRequired,
  renderCard: React.PropTypes.func.isRequired,
  onSwipedAll: React.PropTypes.func,
  onSwiped: React.PropTypes.func,
  onSwipedLeft: React.PropTypes.func,
  onSwipedRight: React.PropTypes.func,
  onSwipedTop: React.PropTypes.func,
  onSwipedBottom: React.PropTypes.func,
  cardIndex: React.PropTypes.number,
  infinite: React.PropTypes.bool,
  secondCardZoom: React.PropTypes.number,
  backgroundColor: React.PropTypes.string,
  marginTop: React.PropTypes.number,
  marginBottom: React.PropTypes.number,
  cardTopMargin: React.PropTypes.number,
  cardLeftMargin: React.PropTypes.number,
  outputRotationRange: React.PropTypes.array,
  inputRotationRange: React.PropTypes.array,
  animateOpacity: React.PropTypes.bool,
  inputOpacityRange: React.PropTypes.array,
  outputOpacityRange: React.PropTypes.array,
  verticalThreshold: React.PropTypes.number,
  horizontalThreshold: React.PropTypes.number,
}

Swiper.defaultProps = {
  cardIndex: 0,
  onSwiped: (cardIndex) => { console.log(cardIndex) },
  onSwipedLeft: (cardIndex) => { console.log('onSwipedLeft') },
  onSwipedRight: (cardIndex) => { console.log('onSwipedRight') },
  onSwipedTop: (cardIndex) => { console.log('onSwipedTop') },
  onSwipedBottom: (cardIndex) => { console.log('onSwipedBottom') },
  onSwipedAll: () => { console.log('onSwipedAll') },
  infinite: false,
  verticalThreshold: height / 5,
  horizontalThreshold: width / 4,
  secondCardZoom: 0.97,
  backgroundColor: '#4FD0E9',
  marginTop: 0,
  marginBottom: 0,
  cardTopMargin: 60,
  cardLeftMargin: 20,
  outputRotationRange: ["-10deg", "0deg", "10deg"],
  inputRotationRange: [-width / 2, 0, width / 2],
  animateOpacity: false,
  inputOpacityRangeX: [-width / 2, -width / 3, 0, width / 3, width / 2],
  outputOpacityRangeX: [0.8, 1, 1, 1, 0.8],
  inputOpacityRangeY: [-height / 2, -height / 3, 0, height / 3, height / 2],
  outputOpacityRangeY: [0.8, 1, 1, 1, 0.8]
}

export default Swiper
