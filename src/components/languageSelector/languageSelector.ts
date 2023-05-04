import './languageSelector.css';

type LanguageSelectorItem = { value: Languages, title: string; };
type Languages = 'ru' | 'en-US';

interface LanguageSelectorParams {
    defaultLanguage: string;
    languages: LanguageSelectorItem[];

    onChange: (value: Languages) => void;
}

export class LanguageSelector {
    private currentIndex = 0;
    private languages: LanguageSelectorItem[];
    private onChange: LanguageSelectorParams['onChange'];

    private dom = document.querySelector('.language-selector') as HTMLDivElement;

    constructor(params: LanguageSelectorParams) {
        const { defaultLanguage, languages, onChange } = params;

        this.languages = languages;
        this.onChange = onChange;

        this.dom.addEventListener('click', () => {
            this.selectNextLanguage();
            this.onChange(this.getValue());
        });

        this.setValue(defaultLanguage);
    }

    setValue(value: string) {
        this.languages.some((item, i) => {
            if (item.value === value) {
                this.dom.innerText = item.title;
                this.dom.dataset.textId = item.value;
                this.currentIndex = i;

                return true;
            }

            return false;
        });
    }

    getValue() {
        return this.languages[this.currentIndex].value;
    }

    selectNextLanguage() {
        this.currentIndex++;
        if (this.currentIndex >= this.languages.length) {
            this.currentIndex = 0;
        }

        this.setValue(this.languages[this.currentIndex].value);
    }
}
