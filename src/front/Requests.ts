const headers = new Headers();
headers.append('Accept', 'application/json')


export default class Requests {
  static MetadataRequest() {
    return new Request('/metadata', {
      method: 'GET',
      headers,
    });
  }

  static TurnRequest() {
    return new Request('/turn', {
      method: 'GET',
      headers,
    });
  }

  static InfoRequest(x: number, y: number) {
    return new Request(`/info?col=${x}&row=${y}`, {
      method: 'GET',
      headers,
    });
  }

  static AllInfoRequest() {
    return new Request('/allinfo', {
      method: 'GET',
      headers,
    });
  }

  static StatsRequest() {
    return new Request('/stats', {
      method: 'GET',
      headers,
    });
  }

  static DetailsRequest(stat: string) {
    return new Request(`/details?stat=${stat}`, {
      method: 'GET',
      headers,
    });
  }
}
