export default (vueInst, googleMapsInst, events) => {
  for (const eventName of events) {
    // TODO: $listeners seemed to be removed in vue3
    if (vueInst.$gmapOptions.autobindAllEvents ||
        vueInst.$listeners[eventName]) {
      googleMapsInst.addListener(eventName, (ev) => {
        vueInst.$emit(eventName, ev)
      })
    }
  }
}
