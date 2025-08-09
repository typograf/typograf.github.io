import { prepareLocale } from '../../helpers/prepareLocale';
import { I18NLanguage, i18n, i18nUpdatePage, setI18nLang } from '../../i18n/i18n';
import { getHashParam, isPrefsHash, resetHash, setPrefsHash, setTextHashParam } from '../../helpers/hash';
import { metrikaReachGoal } from '../../services/metrika';
import { config } from './config';
import { Typograf } from '../../helpers/typograf';

import { LanguageSelector } from '../languageSelector/languageSelector';
import { Prefs } from '../prefs/prefs';
import { Header } from '../header/header';
import { Input } from '../input/input';
import { Result } from '../result/result';
import { CopyIcon } from '../copyIcon/copyIcon';
import { SaveFileIcon } from '../saveFileIcon/saveFileIcon';

import '../container/container';
import '../table/table';
import '../footer/footer';

import './app.css';
import { ShareIcon } from '../shareIcon/shareIcon';
import { isJSON, typografyJSON } from '../../helpers/json';

export class App {
    private lastText: { value: string, result: string; } = { value: '', result: ''};
    private isMobile = document.body.classList.contains('page_mobile');
    private typograf = new Typograf({ locale: [ 'ru' ] });

    private input: Input;
    private result: Result;
    private prefs: Prefs;

    constructor() {
        document.body.classList.remove('transition_no');

        this.input = new Input({
            isMobile: this.isMobile,
            onChange: () => {
                this.execute();
            },
        });

        this.initActionIcons();

        new Header({
            onClick: this.handlePrefsClick,
        });

        this.prefs = new Prefs({
            typograf: this.typograf,
            getLanguage: () => config.language,
            getMode() {
                return config.mode;
            },
            getLocale() {
                return config.locale;
            },
            getOnlyInvisible() {
                return config.onlyInvisible;
            },
            onChange: (data) => {
                config.locale = data.locale;
                config.mode = data.mode;
                config.onlyInvisible = data.onlyInvisible;
                config.rules = data.rules;

                this.execute();
            },
        });

        new LanguageSelector({
            defaultLanguage: config.language,
            languages: [{
                value: 'ru',
                title: i18n('ru'),
            }, {
                value: 'en-US',
                title: i18n('en-US'),
            }],
            onChange: (value: I18NLanguage) => {
                setI18nLang(value);
                config.language = value;
                i18nUpdatePage();
                metrikaReachGoal('switch-lang');
            },
        });

        this.result = new Result();

        this.prepareRules();

        if (!this.isMobile) {
            this.setValue(getHashParam('text') || '');
        }

        this.execute();

        if (isPrefsHash()) {
            setTimeout(() => {
                this.handlePrefsClick();
            }, 0);
        }
    }

    private initActionIcons() {
        new CopyIcon({
            getText: () => this.getResultForAction(),
            onClick: () => metrikaReachGoal('copy-text'),
        });

        new SaveFileIcon({
            getText: () => this.getResultForAction(),
            onClick: () => metrikaReachGoal('save-text'),
        });

        new ShareIcon({
            getText: () => this.getResultForAction(),
            onClick: () => metrikaReachGoal('share-text'),
        });
    }

    private getResultForAction() {
        return this.isMobile ?
            this.input.getValue() :
            this.lastText.result;
    }

    private prepareRules() {
        const { rules } = config;
        this.typograf.enableRule(rules.enabled);
        this.typograf.disableRule(rules.disabled);
    }

    private typografy(value: string) {
        if (isJSON(value)) {
            return typografyJSON(value, text => {
                return this.typograf.execute(text, this.getTypografSettings())
            });
        } else {
            return this.typograf.execute(value, this.getTypografSettings())
        }
    }

    execute() {
        const value = this.input.getValue();
        const result = this.typografy(value);

        this.lastText = { value, result };

        if (this.isMobile) {
            this.input.setValue(this.lastText.result);
        } else {
            if (this.lastText.value.length < 10000) {
                this.result.update(
                    this.lastText.value,
                    this.lastText.result,
                );
            } else {
                this.result.updateWithDebounce(
                    this.lastText.value,
                    this.lastText.result,
                );
            }
        }
    }

    private getTypografSettings() {
        return {
            locale: prepareLocale(config.locale),
            htmlEntity: {
                type: config.mode,
                onlyInvisible: config.onlyInvisible,
            }
        };
    }

    private setValue(value: string) {
        this.input.setValue(value);

        if (this.isMobile || this.prefs.opened()) {
            return;
        }

        setTextHashParam(value);
    }

    private handlePrefsClick = () => {
        this.prefs.toggle();

        if (this.prefs.opened()) {
            setPrefsHash();
        } else {
            setTimeout(() => {
                resetHash();
                this.execute();
            }, 0);
        }
    }
}
