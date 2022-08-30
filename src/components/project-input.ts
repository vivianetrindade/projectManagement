import { autoBind } from "../decorators/autobind";
import { projectState } from "../state/project-state";
import { Validatable, validate } from "../util/validation";
import { Component } from "./base-component";



  export class ProjectInput extends Component <HTMLDivElement, HTMLFormElement> {
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElemenT: HTMLInputElement;
  
    constructor(){
      super('project-input', 'app', true, 'user-input' )
  
      this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement;
      this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement;
      this.peopleInputElemenT = this.element.querySelector('#people') as HTMLInputElement;
  
      this.configure();
    }
    configure() {
      this.element.addEventListener('submit', this.submitHandler);
    }
  
    renderContent(): void {
    }
  
    private gatherUserInput(): [string, string, number] | void {
      const enteredTitle = this.titleInputElement.value;
      const enteredDescription = this.descriptionInputElement.value;
      const enteredPeople = this.peopleInputElemenT.value;
  
      const titleValidatable: Validatable = {
        value: enteredTitle,
        required: true
      };
      const descriptionValidatable: Validatable = {
        value: enteredDescription,
        required: true,
        minLength: 5
      };
      const peopleValidatable: Validatable = {
        value: +enteredPeople,
        required: true,
        min: 1,
        max: 5
      };
  
      if (
        !validate(titleValidatable) ||
        !validate(descriptionValidatable) ||
        !validate(peopleValidatable)
      ){
        alert('Invalid input, please try again!');
        return;
      }
      return [enteredTitle, enteredDescription, +enteredPeople];
    }
    private clearInputs() {
      this.titleInputElement.value = '';
      this.descriptionInputElement.value = '';
      this.peopleInputElemenT.value = '';
    }
  
    @autoBind
    private submitHandler(event: Event) {
      event.preventDefault();
      const userInput = this.gatherUserInput();
      if(Array.isArray(userInput)){
        const [title, description, people] = userInput;
        projectState.addProject(title, description, people)
        this.clearInputs();
      }
    }
  }
