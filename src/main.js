import loadGmapApi from './manager/initializer'
import promiseLazyFactory from './factories/promise-lazy'
import { reactive } from 'vue';

import KmlLayer from './components/kml-layer'
import Marker from './components/marker'
import Polyline from './components/polyline'
import Polygon from './components/polygon'
import Circle from './components/circle'
import Rectangle from './components/rectangle'

// Vue component imports
import InfoWindow from './components/info-window.vue'
import Map from './components/map.vue'
import StreetViewPanorama from './components/street-view-panorama.vue'
import PlaceInput from './components/place-input.vue'
import Autocomplete from './components/autocomplete.vue'

import MapElementMixin from './mixins/map-element'
import MapElementFactory from './factories/map-element'
import MountableMixin from './mixins/mountable'

// HACK: Cluster should be loaded conditionally
// However in the web version, it's not possible to write
// `import 'vue2-google-maps/src/components/cluster'`, so we need to
// import it anyway (but we don't have to register it)
// Therefore we use babel-plugin-transform-inline-environment-variables to
// set BUILD_DEV to truthy / falsy
const Cluster = (process.env.BUILD_DEV === '1')
  ? undefined
  : ((s) => s.default || s)(require('./components/cluster'))

let GmapApi = null

// export everything
export {
  loadGmapApi, KmlLayer, Marker, Polyline, Polygon, Circle, Cluster, Rectangle,
  InfoWindow, Map, PlaceInput, MapElementMixin, MapElementFactory, Autocomplete,
  MountableMixin, StreetViewPanorama
}

export function install (app, options) {
  // Set defaults
  options = {
    installComponents: true,
    autobindAllEvents: false,
    ...options
  }

  // Update the global `GmapApi`. This will allow
  // components to use the `google` global reactively
  // via:
  //   import {gmapApi} from 'vue2-google-maps'
  //   export default {  computed: { google: gmapApi }  }
  GmapApi = reactive({ data: { gmapApi: null } })

  // TODO: replace event bus pattern
  // const defaultResizeBus = new Vue()

  // Use a lazy to only load the API when
  // a VGM component is loaded
  const promiseLazyCreator = promiseLazyFactory(loadGmapApi, GmapApi)
  const gmapApiPromiseLazy = promiseLazyCreator(options)

  Vue.mixin({
    created () {
      this.$gmapDefaultResizeBus = defaultResizeBus
      this.$gmapOptions = options
      this.$gmapApiPromiseLazy = gmapApiPromiseLazy
    }
  })

  app.$gmapDefaultResizeBus = defaultResizeBus
  app.$gmapApiPromiseLazy = gmapApiPromiseLazy

  if (options.installComponents) {
    app.component('GmapMap', Map)
    app.component('GmapMarker', Marker)
    app.component('GmapInfoWindow', InfoWindow)
    app.component('GmapKmlLayer', KmlLayer)
    app.component('GmapPolyline', Polyline)
    app.component('GmapPolygon', Polygon)
    app.component('GmapCircle', Circle)
    app.component('GmapRectangle', Rectangle)
    app.component('GmapAutocomplete', Autocomplete)
    app.component('GmapPlaceInput', PlaceInput)
    app.component('GmapStreetViewPanorama', StreetViewPanorama)
  }
}

export function gmapApi () {
  return GmapApi.gmapApi && window.google
}
