import { Component, Input, SimpleChanges, OnChanges, EventEmitter, Output, HostListener, ViewChild, ElementRef, OnInit, AfterViewInit, Renderer2 } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';


@Component({
  selector: 'app-autocompleter',
  templateUrl: './autocompleter.component.html',
  styleUrls: ['./autocompleter.component.scss']
})
export class AutocompleterComponent implements OnChanges, OnInit, AfterViewInit {

  @ViewChild('inputField', { static: true }) inputField: ElementRef;
  @ViewChild('input') input: ElementRef<HTMLInputElement>;

  @Input() placeholder: string = "Search";
  @Input() threshold: number = 0;
  @Input() public highlightColor: string = 'black';
  @Input() inputClass: string;
  @Input() data: any[] = [];
  @Input() alwaysOpen: boolean = false;

  @Input() actionIcon: string;
  @Input() actionText: string;
  @Input() autofocus: boolean = false;
  @Output() actionPerformed = new EventEmitter();


  @Output() inputTermChanged = new EventEmitter<string>();
  @Output() inputTermEntered = new EventEmitter<string>();
  @Output() inputTermSearched = new EventEmitter<string>();
  @Output() inputTermCleared = new EventEmitter();
  @Output() autocompleterTermEntered = new EventEmitter<string>();

  @Output()
  inputTermChange: EventEmitter<string> = new EventEmitter<string>();
  @Input() inputTerm: string = '';

  currentHoveredTerm: string = '';
  currentHoveredTermIndex: number;
  displayAutocomplete = false;
  isAutocompleteHovered = false;

  showClear = false;
  showSearch = false;

  constructor(private sanitizer: DomSanitizer,private renderer: Renderer2) { }

  ngOnInit() {
    if (this.inputClass !== undefined) {
      this.inputField.nativeElement.classList.add(this.inputClass);
    }
    if (this.inputTermCleared.observers.length > 0) {
      this.showClear = true;
    }
    if (this.inputTermSearched.observers.length > 0) {
      this.showSearch = true;
    }
  }

  ngAfterViewInit(): void {
    if (this.autofocus) {
      this.receiveAutofocus();
    }
  }

  receiveAutofocus() {
    this.renderer.selectRootElement(this.input.nativeElement).focus();
  }


  clearSearchTerm() {
    this.inputTerm = '';
    this.inputTermCleared.emit();
    this.renderer.selectRootElement(this.input.nativeElement).focus();
  }

  searchClicked() {
    this.inputTermSearched.emit(this.inputTerm);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.displayAutocomplete) {

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        this.navigateAutocomplete('up');

      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        this.navigateAutocomplete('down');
      }
    }
  }

  navigateAutocomplete(direction: 'up' | 'down') {
    if (this.currentHoveredTermIndex === undefined) {
      this.currentHoveredTermIndex = -1;
    }
    this.isAutocompleteHovered = true;
    let nextIndex: number;
    if (direction === 'up') {
      if (this.currentHoveredTermIndex > 0) {
        nextIndex = this.currentHoveredTermIndex - 1;
      } else {
        this.isAutocompleteHovered = false;
      }

    } else if (direction === 'down') {
      nextIndex = this.currentHoveredTermIndex < this.data.length - 1 ? this.currentHoveredTermIndex + 1 : this.data.length - 1;
    }
    this.currentHoveredTerm = this.data[nextIndex];
    this.currentHoveredTermIndex = nextIndex;

    const element = document.getElementsByClassName('hovered')[0];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'start' });
    }

  }

  onActionPerformed() {
    this.actionPerformed.emit();
  }

  onInputChange(event: any) {
    this.currentHoveredTerm = '';
    this.currentHoveredTermIndex = undefined;
    if (event.target.value.length > this.threshold) {
      this.inputTermChanged.emit(event.target.value);
      this.displayAutocomplete = true;
    }
    else {
      this.displayAutocomplete = false;
    }
  }

  onSubmit() {
    if (this.isAutocompleteHovered) {
      this.autocompleterTermEntered.emit(this.currentHoveredTerm);
    } else {
      this.inputTermEntered.emit(this.inputTerm);
    }
    this.inputTerm = '';
    this.displayAutocomplete = false;

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && !changes['data'].firstChange) {
      this.sortData();
    }
  }

  sortData() {
    this.data.sort((a, b) => {
      const aPos = a.toLowerCase().indexOf(this.inputTerm.toLowerCase());
      const bPos = b.toLowerCase().indexOf(this.inputTerm.toLowerCase());
      if (aPos === -1 && bPos === -1) {
        return a.length - b.length; // If `inputTerm` is not present in both elements, sort based on length.
      } else if (aPos === -1) {
        return 1; // Element `a` doesn't contain `inputTerm`, so it will be placed after element `b`.
      } else if (bPos === -1) {
        return -1; // Element `b` doesn't contain `inputTerm`, so it will be placed after element `a`.
      } else {
        return aPos - bPos; // Sort based on the position of the first occurrence of `inputTerm`.
      }
    });
  }

  onSearchTermClicked(term: string) {
    this.autocompleterTermEntered.emit(term);
    this.inputTerm = '';
    this.displayAutocomplete = false;
  }

  getFormattedResult(result: string): SafeHtml {
    const regex = new RegExp(this.inputTerm, 'gi');
    const formattedText = result.replace(regex, `<span style="color: ${this.highlightColor}; font-weight: bold;">$&</span>`);
    return this.sanitizer.bypassSecurityTrustHtml(formattedText);
  }
}

