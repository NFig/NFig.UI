import delay from './delay';
import qs from 'qs';
import {
  observable,
  action,
  configure,
  runInAction,
  reaction,
  computed,
  IReactionDisposer,
  comparer,
} from 'mobx';
import { asyncAction } from 'mobx-utils';
import debounce from './debounce';
import { ISettingsModel, ISetting, INewOverride } from './interfaces';

configure({ enforceActions: true });

async function fetchJson(url: string, init?: RequestInit) {
  const response = await fetch(url, init);
  if (response.ok) {
    return await response.json();
  } else {
    throw new Error(
      `Request returned ${response.status} ${response.statusText}`,
    );
  }
}

const fetchWithMinimumDelay = (
  url: string,
  minDelay: number,
  init: RequestInit = {
    method: 'GET',
    credentials: 'include',
  },
) =>
  Promise.all([fetchJson(url, init), delay(minDelay)]).then(
    ([results]) => results,
  );

const postWithMinimumDelay = (url: string, minDelay: number, reqBody: any) =>
  fetchWithMinimumDelay(url, minDelay, {
    method: 'POST',
    body: JSON.stringify(reqBody),
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

function contains(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().indexOf(needle.toLowerCase()) !== -1;
}

function parseHash() {
  return location.hash.length > 1 ? qs.parse(location.hash.substring(1)) : {};
}

const updateHash = (values: any) => {
  let newHash = qs.stringify({ ...parseHash(), ...values });
  newHash = newHash ? `#${newHash}` : '';
  if (newHash !== location.hash) {
    history.pushState(
      null,
      null,
      location.pathname + location.search + newHash,
    );
  }
};

export class Store {
  constructor(setUrl: string, clearUrl: string) {
    // Parse out the hash query string and set initial options
    // Untracked so that we don't fire off any reactions during
    // construction.
    this.onPopState();
    window.addEventListener('popstate', this.onPopState);

    this._setUrl = setUrl;
    this._clearUrl = clearUrl;

    // Set up a debounced reaction that will handle updating
    // the location.hash querystring
    this._disposeHashReaction = reaction(
      () => ({
        filter: this.filter || undefined,
        editing: this._editing ? this._editing : undefined,
      }),
      debounce(v => {
        if (!this._isPoppingState) {
          updateHash(v);
        } else {
          this._isPoppingState = false;
        }
      }, 500),
      {  equals: comparer.structural },
    );
  }

  dispose() {
    window.removeEventListener('popstate', this.onPopState);
    this._disposeHashReaction();
  }

  private _isPoppingState: boolean = false;
  private _disposeHashReaction: IReactionDisposer;

  private _setUrl: string;
  private _clearUrl: string;

  @action
  onPopState = (e?: PopStateEvent) => {
    this._isPoppingState = !!e;
    const parsed = parseHash();
    this.filter = parsed.filter || '';
    this._editing = parsed.editing || null;
  };

  /**
   * Loads settings from the given url
   * @param url The url to load the settings from
   */
  @asyncAction
  public *load(url: string) {
    this.loading = true;
    try {
      const results: ISettingsModel = yield fetchWithMinimumDelay(url, 500);
      this._model = observable.object(results);

      // If we're currently editing (loaded from has)
      // then let's rock
      if (!!this._editing) {
        this._selected = this.settings.findIndex(s => s.name === this._editing);
      }
    } catch (e) {
      this.error = e.toString();
    } finally {
      this.loading = false;
    }
  }

  @action
  async setOverride(setting: ISetting, newOverride: INewOverride) {
    this.loading = true;

    const reqBody = {
      settingName: setting.name,
      dataCenter: newOverride.selectedDataCenter,
      value: newOverride.newOverrideValue,
    };

    try {
      const updatedSetting: ISetting = await postWithMinimumDelay(
        this._setUrl,
        500,
        reqBody,
      );

      this.updateSetting(updatedSetting);
    } catch (e) {
      runInAction(() => {
        this.error = e.toString();
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  @action
  async clearOverride(setting: ISetting, dataCenter: string) {
    this.loading = true;
    const reqBody = {
      settingName: setting.name,
      dataCenter,
    };

    try {
      const updatedSetting: ISetting = await postWithMinimumDelay(
        this._clearUrl,
        500,
        reqBody,
      );

      this.updateSetting(updatedSetting);
    } catch (e) {
      runInAction(() => {
        this.error = e.toString();
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  @action
  private updateSetting(updatedSetting: ISetting) {
    // Update the setting
    const index = this._model.settings.findIndex(
      s => s.name === updatedSetting.name,
    );

    this._model.settings[index] = observable(updatedSetting);
    this.error = null;
  }

  @observable private _model: ISettingsModel;
  @observable private _editing: string = null;
  @observable private _selected: number = -1;

  @observable filter: string = '';
  @observable loading: boolean;
  @observable error: any;

  @computed
  get settings() {
    return this._model ? this._model.settings : null;
  }

  @computed
  get dataCenters() {
    return this._model.availableDataCenters;
  }

  @computed
  get selected() {
    return this._selected;
  }

  @computed
  get editing(): ISetting {
    if (!this._model) return null;
    if (!this._model.settings) return null;
    return this._model.settings.find(s => s.name === this._editing) || null;
  }

  @computed
  get selectedSetting(): ISetting {
    if (this._selected === -1) return null;
    if (!this._model) return null;
    if (!this._model.settings) return null;
    return this._model.settings.filter(s => this.isVisible(s))[this._selected];
  }

  @computed
  get tier() {
    return this._model.currentTier;
  }

  @action
  setFilter(val: string) {
    this.filter = val;
  }

  @action
  edit(setting: ISetting | null) {
    this._editing = setting ? setting.name : null;
    this.select(setting);
  }

  private select(setting: ISetting | null) {
    if (setting !== null) {
      this._selected = this._model.settings.indexOf(setting);
    } else {
      this.clearError();
    }
  }

  @action
  selectNext() {
    if (!this._editing && this._selected < this._model.settings.length - 1) {
      this._selected++;
    }
  }

  @action
  selectPrev() {
    if (!this._editing && this._selected >= 0) {
      this._selected--;
    }
  }

  @action
  selectNone() {
    if (!this._editing) {
      this._selected = -1;
    }
  }

  @action
  clearError() {
    this.error = null;
  }

  isVisible(setting: ISetting): boolean {
    // Special case:
    if (this.filter === 'has:override') {
      return setting.allOverrides.length > 0;
    }

    return (
      contains(setting.name, this.filter) ||
      contains(setting.description, this.filter)
    );
  }
}

export function allowsAnyOverrides(setting: ISetting): boolean {
  return Object.keys(setting.allowsOverrides).some(
    k => setting.allowsOverrides[k],
  );
}
