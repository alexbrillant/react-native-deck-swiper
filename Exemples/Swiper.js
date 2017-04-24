import React from 'react'
import {
  PanResponder,
  Easing,
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
    const secondCardIndex = this.calculateSecondCardIndex(props.cardIndex)
    const previousCardIndex = this.calculatePreviousCardIndex(props.cardIndex)
    this.state = {
      pan: new Animated.ValueXY(),
      scale: new Animated.Value(props.secondCardZoom),
      firstCardIndex: props.cardIndex,
      secondCardIndex: secondCardIndex,
      previousCardIndex: previousCardIndex,
      previousCardX: new Animated.Value(props.previousCardInitialPositionX),
      previousCardY: new Animated.Value(props.previousCardInitialPositionY),
      swipedAllCards: false
    }
  }

  calculateSecondCardIndex = (firstCardIndex) => {
    const cardIndexAtLastIndex = firstCardIndex === this.props.cards.length - 1
    return cardIndexAtLastIndex ? 0 : firstCardIndex + 1
  }

  calculatePreviousCardIndex = (firstCardIndex) => {
    const atFirstIndex = firstCardIndex === 0
    return atFirstIndex ? this.props.cards.length - 1 : firstCardIndex - 1
  }

  componentWillMount() {
    this._animatedValueX = 0;
    this._animatedValueY = 0;
    this.state.pan.x.addListener((value) => this._animatedValueX = value.value);
    this.state.pan.y.addListener((value) => this._animatedValueY = value.value);
    this.initCardStyle()
    this.initPanResponder()
  }

  initCardStyle = () => {
    const { cardVerticalMargin, cardHorizontalMargin, marginTop, marginBottom } = this.props
    let cardWidth = width - (cardHorizontalMargin * 2)
    let cardHeight = height - (cardVerticalMargin * 2) - marginTop - marginBottom
    this.cardStyle = {
      top: cardVerticalMargin,
      left: cardHorizontalMargin,
      width: cardWidth,
      height: cardHeight
    }
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

  swipeBack = (cb) => {
    Animated.spring(
      this.state.previousCardY, {
        toValue: 0,
        friction: this.props.swipeBackFriction,
        duration: this.props.swipeBackAnimationDuration
      }
    ).start(() => {
      this.decrementCardIndex(cb)
    })
  }

  swipeCard1 = (onSwiped) => {
    Animated.timing(
      this.state.pan, {
        toValue: {
          x: this._animatedValueX * 4.5,
          y: this._animatedValueY * 4.5
        },
        duration: this.props.swipeAnimationDuration
      }
    ).start(() => {
      this.incrementCardIndex(onSwiped)
    })
  }

  zoomCard2 = () => {
    Animated.spring(
      this.state.scale, {
        toValue: 1,
        friction: this.props.zoomFriction,
        duration: this.props.zoomAnimationDuration,
      }
    ).start()
  }

  incrementCardIndex = (onSwiped) => {
    const { firstCardIndex } = this.state
    let newCardIndex = firstCardIndex + 1
    let swipedAllCards = false
    if (newCardIndex === this.props.cards.length) {
      newCardIndex = 0
      swipedAllCards = true
    }
    this.onSwipedCallbacks(onSwiped, swipedAllCards)
    this.setCardIndex(newCardIndex, swipedAllCards)
  }

  decrementCardIndex = (cb) => {
    const { firstCardIndex } = this.state
    const newCardIndex = firstCardIndex === 0 ? this.props.cards.length - 1 : firstCardIndex - 1
    const swipedAllCards = false 
    this.onSwipedCallbacks(cb, swipedAllCards)
    this.setCardIndex(newCardIndex, swipedAllCards)
  }

  jumpToCardIndex = (newCardIndex) => {
    if (this.props.cards[newCardIndex]) {
      this.setCardIndex(newCardIndex, false)
    }
  }

  onSwipedCallbacks = (swipeDirectionCallback, swipedAllCards) => {
    let previousCardIndex = this.state.firstCardIndex
    this.props.onSwiped(previousCardIndex)
    swipeDirectionCallback(previousCardIndex)
    if (swipedAllCards) {
      this.props.onSwipedAll()
    }
  }

  setCardIndex = (newCardIndex, swipedAllCards) => {
    this.setState((prevState) => {
      const { cards } = this.props
      const secondCardIndex = this.calculateSecondCardIndex(newCardIndex)
      const previousCardIndex = this.calculatePreviousCardIndex(newCardIndex)
      return {
        ...prevState,
        firstCardIndex: newCardIndex,
        secondCardIndex: secondCardIndex,
        previousCardIndex: previousCardIndex,
        swipedAllCards: swipedAllCards
      }
    }, this.resetPanAndScale)
  }

  resetPanAndScale = () => {
    this.state.pan.setValue({ x: 0, y: 0 });
    this.state.scale.setValue(this.props.secondCardZoom);
    this.state.previousCardX.setValue(this.props.previousCardInitialPositionX)
    this.state.previousCardY.setValue(this.props.previousCardInitialPositionY)
  }

  componentWillUnmount() {
    this.state.pan.x.removeAllListeners();
    this.state.pan.y.removeAllListeners();
  }

  calculateSwipableCardStyle = () => {
    let opacity = this.props.animateOpacity ? this.interpolateOpacity() : 1
    let rotation = this.interpolateRotation()
    return [
      styles.card,
      this.cardStyle,
      {
        zIndex: 3,
        opacity: opacity,
        transform: [
          {translateX: this.state.pan.x},
          {translateY: this.state.pan.y},
          {rotate: rotation}
        ]
      }
    ]
  }

  calculateSecondCardZoomStyle = () => {
    return [
      styles.card,
      this.cardStyle,
      {
        zIndex: 1,
        transform: [
          {scale: this.state.scale}
        ]
      }
    ]
  }

  calculateSwipeBackCardStyle = () => {
    return [
      styles.card,
      this.cardStyle,
      {
        zIndex: 4,
        transform: [
          {translateX: this.state.previousCardX},
          {translateY: this.state.previousCardY}
        ]
      }
    ]
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
    } else {
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
    return (
      <View style = {
        [styles.container,
          {
            backgroundColor: this.props.backgroundColor,
            marginTop: this.props.marginTop,
            marginBottom: this.props.marginBottom
          }
        ]}>
        {this.props.children}
        {this.renderFirstCard()}
        {this.renderSecondCard()}
        {this.renderSwipeBackCard()}
      </View>
    )
  }

  renderFirstCard = () => {
    const { firstCardIndex } = this.state
    const { cards } = this.props
    const swipableCardStyle = this.calculateSwipableCardStyle()
    const firstCardContent = cards[firstCardIndex]
    let firstCard = this.props.renderCard(firstCardContent)
    const notInfinite = !this.props.infinite
    if (notInfinite && this.state.swipedAllCards) {
      firstCard = null
    }
    return (
        <Animated.View
          style={swipableCardStyle}
          {...this._panResponder.panHandlers}>
          {firstCard}
        </Animated.View>
    )
  }

  renderSecondCard = () => {
    const { secondCardIndex } = this.state
    const { cards } = this.props
    const secondCardZoomStyle = this.calculateSecondCardZoomStyle()
    const secondCardContent = cards[secondCardIndex]
    let secondCard = this.props.renderCard(secondCardContent)
    const notInfinite = !this.props.infinite
    const lastCardOrSwipedAllCards = secondCardIndex === 0 || this.state.swipedAllCards
    if (notInfinite && lastCardOrSwipedAllCards) {
      secondCard = null
    }
    
    return (
        <Animated.View
          style={secondCardZoomStyle}>
          {secondCard}
        </Animated.View>
    )
  }

  renderSwipeBackCard = () => {
    const { previousCardIndex } = this.state
    const { cards } = this.props
    const previousCardContent = cards[previousCardIndex]
    const previousCardStyle = this.calculateSwipeBackCardStyle()
    const previousCard = this.props.renderCard(previousCardContent)
    return (
        <Animated.View
          style={previousCardStyle}>
          {previousCard}
        </Animated.View>
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
  zoomFriction: React.PropTypes.number,
  backgroundColor: React.PropTypes.string,
  marginTop: React.PropTypes.number,
  marginBottom: React.PropTypes.number,
  cardVerticalMargin: React.PropTypes.number,
  cardHorizontalMargin: React.PropTypes.number,
  outputRotationRange: React.PropTypes.array,
  inputRotationRange: React.PropTypes.array,
  animateOpacity: React.PropTypes.bool,
  inputOpacityRange: React.PropTypes.array,
  outputOpacityRange: React.PropTypes.array,
  verticalThreshold: React.PropTypes.number,
  horizontalThreshold: React.PropTypes.number,
  previousCardInitialPositionX: React.PropTypes.number,
  previousCardInitialPositionY: React.PropTypes.number,
  swipeAnimationDuration: React.PropTypes.number,
  swipeBackAnimationDuration: React.PropTypes.number,
  zoomAnimationDuration: React.PropTypes.number,
  swipeBackFriction: React.PropTypes.number
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
  zoomFriction: 7,
  backgroundColor: '#4FD0E9',
  marginTop: 0,
  marginBottom: 0,
  cardVerticalMargin: 60,
  cardHorizontalMargin: 20,
  outputRotationRange: ["-10deg", "0deg", "10deg"],
  inputRotationRange: [-width / 2, 0, width / 2],
  animateOpacity: false,
  inputOpacityRangeX: [-width / 2, -width / 3, 0, width / 3, width / 2],
  outputOpacityRangeX: [0.8, 1, 1, 1, 0.8],
  inputOpacityRangeY: [-height / 2, -height / 3, 0, height / 3, height / 2],
  outputOpacityRangeY: [0.8, 1, 1, 1, 0.8],
  previousCardInitialPositionX: 0,
  previousCardInitialPositionY: -height,
  swipeAnimationDuration: 350,
  swipeBackAnimationDuration: 600,
  zoomAnimationDuration: 100,
  swipeBackFriction: 11
}

export default Swiper