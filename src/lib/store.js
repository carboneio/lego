class Store {
  constructor(state = {}, actions = {}) {
    this.__state = state
    this.actions = actions
    this.subscribers = []
  }

  subscribe(subscriber, props = []) {
    const selectedProps = Array.isArray(props) ? props : Object.keys(props)
    subscriber.setState(this.getSelectedState(selectedProps))
    this.subscribers.push({ target: subscriber, props: selectedProps })
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
    this.__state = { ...this.state, ...newState }
    this.notify()
  }

  getSelectedState(selectedProps) {
    return selectedProps.reduce((selectedState, prop) => {
      if (prop in this.state) {
        selectedState[prop] = this.state[prop]
      }
      return selectedState
    }, {})
  }

  notify() {
    this.subscribers.forEach(({ target, props }) => {
      target.render(this.getSelectedState(props))
    })
  }

  dispatch(actionName, ...payload) {
    const action = this.actions[actionName]
    if (action) action.bind(this)(...payload)
    else throw new Error(`action "${actionName}" does not exist`)
  }
}

export default Store
