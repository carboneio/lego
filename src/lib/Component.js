import { render } from '../../node_modules/petit-dom/src/index.js'


const _toCamelCaseCache = {};
function toCamelCase(name) {
  if (_toCamelCaseCache[name] !== undefined) {
    return _toCamelCaseCache[name]
  }
  if(name.includes('-')) {
    const parts = name.split('-')
    _toCamelCaseCache[name] = parts[0] + parts.splice(1).map(s => s[0].toUpperCase() + s.substr(1)).join('')
    return _toCamelCaseCache[name]
  }
  return name;
}


export default class extends HTMLElement {
  constructor() {
    super()
    this.useShadowDOM = true
    this.__isConnected = false
    this.__state = {}
    if(this.init) this.init()
    this.watchProps = Object.keys(this.__state)
    this.__attributesToState()
    this.document = this.useShadowDOM ? this.attachShadow({mode: 'open'}) : this
    this.__debounceRender = null;
    if(this.afterInit) this.afterInit()
  }

  __attributesToState() {
    Object.assign(this.state, Array.from(this.attributes).reduce((obj, attr) => {
      return Object.assign(obj, { [toCamelCase(attr.name)]: attr.value })
    }, {}))
  }

  get vdom() { return ({ state }) => '' }

  get vstyle() { return ({ state }) => '' }

  setAttribute(name, value) {
    if (typeof(value) === 'string') {
      super.setAttribute(name, value)
    }
    const prop = toCamelCase(name)
    if(this.watchProps.includes(prop)) this.render({ [prop]: value })
  }

  removeAttribute(name) {
    super.removeAttribute(name)
    const prop = toCamelCase(name)
    if(this.watchProps.includes(prop) && prop in this.state) {
      this.render({ [prop]: null })
      delete this.state[prop]
    }
  }

  debounce(func, timeout = 300, ...args){
    clearTimeout(func.debounceTimer);
    func.debounceTimer = setTimeout(() => { func.apply(this, args); }, timeout);
  }

  async connectedCallback() {
    this.__isConnected = true
    this.render({}, false)
    // First rendering of the component
    if(this.connected) this.connected()
  }

  disconnectedCallback() {
    this.__isConnected = false
    this.setState({})
    if(this.disconnected) this.disconnected()
  }

    setState(updated = {}) {
      const previous = Object.keys(updated).reduce((obj, key) => Object.assign(obj, { [key]: this.__state[key] }), {})
      Object.assign(this.__state, updated)
      if(this.changed && this.__isConnected) this.changed(updated, previous)
    }

  set state(value) {
    this.setState(value)
  }

  get state() {
    return this.__state
  }

  render(state, debounce = true) {
    this.setState(state)
    if(!this.__isConnected) return
    if (debounce === false) return this.renderDebounce();
    clearTimeout(this.__debounceRender);
    // debounce to avoid 3 call when the parent component pass 3 attributes to a child component. 
    // In that case, this.setAttribute is called 3 times by petit dom when re-creating the dom
    this.__debounceRender = setTimeout(() => {
      this.renderDebounce();
    }, 0);
  }

  renderDebounce() {
    return render([
      this.vdom({ state: this.__state }),
      this.vstyle({ state: this.__state }),
    ], this.document)
  }
}
