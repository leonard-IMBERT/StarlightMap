import Card from './manipulator/manipulator'
import CardComponent from './manipulator/manipulator';

export default class Requests {
  static MetadataRequest() { return new Request('/metadata', {
    method: 'GET',
    headers: (new Headers()).append('Accept','application/json')
  })}

  static TurnRequest() { return new Request('/turn', {
    method: 'GET',
    headers: (new Headers()).append('Accept','application/json')
  })}

  static InfoRequest(x,y) { return new Request(`/info?col=${x}&row=${y}`, {
    method: 'GET',
    headers: (new Headers()).append('Accept', 'application/json')
  })}

  static AllInfoRequest() { return new Request(`/allinfo`, {
    method: 'GET',
    headers: (new Headers()).append('Accept', 'application/json')
  })}

  static StatsRequest() { return new Request('/stats', {
    method: 'GET',
    headers: (new Headers()).append('Accept','application/json')
  })}

  static DetailsRequest(stat) { return new Request(`/details?stat=${stat}`, {
    method: 'GET',
    headers: (new Headers()).append('Accept', 'application/json')
  })}
}

if(navigator.userAgent.indexOf("Chrome") >  -1) {
  customElements.define(CardComponent.ElementName, CardComponent);
}
