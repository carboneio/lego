class Store {
  constructor(state = {}) {
    this.__state = state;
    this.subscribers = [];
  }

  subscribe(subscriber, props = []) {
    const selectedProps = Array.isArray(props) ? props : Object.keys(props);
    subscriber.setState(this.getSelectedState(selectedProps));
    this.subscribers.push({ target: subscriber, props: selectedProps });
    subscriber.__stores.push(this);
  }
  
  unsubscribe (subscriber) {
    const activeSubscribers = [];
    for (let i = 0; i < this.subscribers.length; i++) {
      const sub = this.subscribers[i];
      if (sub.target !== subscriber) {
        activeSubscribers.push(sub);
      }
    }
    this.subscribers = activeSubscribers;
  }

  get state() {
    return this.__state
  }

  setState(newState) {
    this.__state = { ...this.state, ...newState };
    this.notify(newState);
  }

  getSelectedState(selectedProps) {
    return selectedProps.reduce((selectedState, prop) => {
      if (prop in this.state) {
        selectedState[prop] = this.state[prop];
      }
      return selectedState
    }, {})
  }

  updateSelectedState(updatedProps, subscribedProps) {
    const _selectedState = {};
    let _atLeastOneUpdate = 0;
    for (var i = 0; i < subscribedProps.length; i++) {
      const _prop = subscribedProps[i];
      if (updatedProps === undefined  || updatedProps[_prop] !== undefined) {
        _selectedState[_prop] = this.state[_prop];
        _atLeastOneUpdate |= 1;
      }
    }
    if (_atLeastOneUpdate === 1) {
      return _selectedState;
    }
    return null;
  }

  /**
   * Notify all subscribers
   *
   * @param  {Object}  updatedProps [Optional] The updated properties (= partial new state). Ex { att1 : 1, att2 : 2}
   */
  notify(updatedProps) {
    this.subscribers.forEach(({ target, props }) => {
      const _stateUpdated = this.updateSelectedState(updatedProps, props);
      if (_stateUpdated !== null) {
        // update DOM only if the subscriber is listening the updated prop
        // console.log('notify', target, props)
        target.render(_stateUpdated);
      }
    });
  }
  
}

export { Store as default };
