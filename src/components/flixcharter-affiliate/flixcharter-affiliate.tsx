import { Component, Prop, State, Element } from '@stencil/core';

@Component({
  tag: 'flixcharter-affiliate',
  styleUrl: 'flixcharter-affiliate.scss',
  shadow: true
})
export class FlixcharterAffilate {

  @Element() private element: HTMLElement;

  @Prop() dest: string;
  @Prop() destId: string;
  @Prop() start: string;
  @Prop() end: string;
  @Prop() apiKey: string;

  @State() from: string;
  @State() people: number;
  @State() place: google.maps.places.PlaceResult;

  private mapIsdLoaded: boolean = false;

  private loadAutocomplete(): void {
    const input: HTMLInputElement = this.element.shadowRoot.querySelector('#flixcharter-autocomplete') as HTMLInputElement;
    const places = new google.maps.places.Autocomplete(input);
    places.addListener('place_changed', () => {
      const place = places.getPlace();
      this.place = place;
    });
  }

  private transformISOString(dt: Date): string {
    const timezone_offset_min = new Date().getTimezoneOffset();
    const abs = Math.abs(timezone_offset_min / 60);
    let offset_hrs: number | string = parseInt(String(abs));
    let offset_min: number | string = Math.abs(timezone_offset_min % 60);
    let timezone_standard;

    if (offset_hrs < 10)
      offset_hrs = '0' + offset_hrs;

    if (offset_min < 10)
      offset_min = '0' + offset_min;

    if (timezone_offset_min < 0)
      timezone_standard = '+' + offset_hrs + ':' + offset_min;
    else if (timezone_offset_min > 0)
      timezone_standard = '-' + offset_hrs + ':' + offset_min;
    else if (timezone_offset_min == 0)
      timezone_standard = 'Z';

    let current_date: number | string = dt.getDate();
    let current_month: number | string = dt.getMonth() + 1;
    let current_year: number | string = dt.getFullYear();
    let current_hrs: number | string = dt.getHours();
    let current_mins: number | string = dt.getMinutes();
    let current_secs: number | string = dt.getSeconds();
    let current_datetime: string;

    current_date = current_date < 10 ? '0' + current_date : current_date;
    current_month = current_month < 10 ? '0' + current_month : current_month;
    current_hrs = current_hrs < 10 ? '0' + current_hrs : current_hrs;
    current_mins = current_mins < 10 ? '0' + current_mins : current_mins;
    current_secs = current_secs < 10 ? '0' + current_secs : current_secs;

    current_datetime = current_year + '-' + current_month + '-' + current_date + 'T' + current_hrs + ':' + current_mins + ':' + current_secs + timezone_standard;
    return current_datetime;
  }

  private redirectToCharter(e: Event): void {
    e.preventDefault();
    e.stopPropagation();
    if (!this.formIsValid()) {
      return;
    }
    const startDate = new Date(Number(this.start));
    const endDate = new Date(Number(this.end));
    const startISOString = this.transformISOString(startDate);
    const endISOString = this.transformISOString(endDate);

    const placeID = this.place.place_id;
    const departAddress = encodeURI(this.place.formatted_address);
    const destAddress = encodeURI(this.dest);

    let url = `https://charter.flixbus.com/shop/#/${departAddress}/${destAddress}/${startISOString}/${endISOString}/true/${this.people}//${placeID}/${this.destId}`;

    window.open(url, '_blank');
  }

  private injectSDK(): Promise<any> {
    if (this.mapIsdLoaded) {
      return Promise.resolve(true);
    }

    return new Promise((resolve) => {
      window['mapInit'] = () => {
        this.mapIsdLoaded = true;
        this.loadAutocomplete();
        resolve(true);
      }
      let script = document.createElement('script');
      script.id = 'googleMaps';
      if (this.apiKey) {
        script.src = 'https://maps.googleapis.com/maps/api/js?key=' + this.apiKey + '&callback=mapInit&libraries=places';
      } else {
        script.src = 'https://maps.googleapis.com/maps/api/js?callback=mapInit&libraries=places';
      }
      document.body.appendChild(script);
    });
  }

  private handlePeopleChange(event): void {
    this.people = event.target.value;
  }

  private formIsValid(): boolean {
    return this.people && !!this.place;
  }

  componentDidLoad() {
    this.injectSDK();
  }

  render() {
    return [
      <div class="flix-box flixcharter-affiliate">
        <header class="flix-header flix-header--unfixed">
          <div class="flix-header-brand">
            <a class="flix-header-brand__link" href="/">
              <img class="flix-header-brand__img" src="https://charter.flixbus.com/shop/assets/images/logos/FlixBus_charter_logo.svg"
                alt="Flixbus" />
            </a>
          </div>
        </header>
        <div class="flixcharter-content">
          <h3 class="flix-h3 flix-h3--section-header">Rent an entire bus for this event</h3>
          <form onSubmit={(e) => this.redirectToCharter(e)}>
            <div class="flix-grid">
              <div class="flix-col-8-sm flix-col-12">
                <table class="flix-connection">
                  <tbody>
                    <tr>
                      <td>
                        <div class="flix-connection__station">
                          <div class="flix-control">
                            <div class="flix-input">
                              <input type="text" id="flixcharter-autocomplete" class="flix-input__field" placeholder="From..." />
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div class="flix-connection__station">
                          {this.dest}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="flix-col-4-sm flix-col-12">
                <div class="flix-control flix-space-xs-bottom">
                  <div class="flix-input">
                    <input type="number" class="flix-input__field" onInput={(e) => this.handlePeopleChange(e)} placeholder="Qty passengers" />
                  </div>
                </div>
                <div class="flix-control  flix-space-flush-bottom">
                  <button type="submit" disabled={!this.formIsValid()} class="flix-btn flix-btn--primary flix-btn--block"> Search </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    ]
  }
}
