
// Project type
enum ProjectStatus {
  active,
  finished
}

class Project {
  constructor(
    public id: string, 
    public title: string, 
    public description: string, 
    public people: number, 
    public status:  ProjectStatus) {

  }
}

// Project State Management
type Listener<T> = (items: T[]) => void;

class State <T> {
  protected listeners: Listener<T> [] = []

  addListener (listenerFn: Listener<T>) {
    this.listeners.push(listenerFn);
  }
}
class ProjectState extends State<Project> {
  
  private projects: Project[] = [];
  private static instance: ProjectState;

  private constructor() {
    super()
  }

  
  static getInstance() {
    if(this.instance){
      return this.instance 
    }
    this.instance = new ProjectState()
    return this.instance
  }
  
  
  addProject(title: string, description: string, numOfPeople: number){
    const newProject = new Project (
      Math.random().toString(), 
      title, 
      description, 
      numOfPeople, 
      ProjectStatus.active
    )
    this.projects.push(newProject)
    for (const listenerFn of this.listeners){
      listenerFn(this.projects.slice())
    }
  }
}

const projectState = ProjectState.getInstance();

//Decorator
function autoBind(_: any, _2: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    }
  };
  return adjDescriptor;
}

//Validation
interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

function validate(validatableInput: Validatable) {
  let isValid = true;

  if (validatableInput.required) {
    isValid = isValid && validatableInput.value.toString().trim().length !== 0;
  }
  if (validatableInput.minLength != null && typeof validatableInput.value === 'string') {
    isValid = isValid && validatableInput.value.length >= validatableInput.minLength;
  }
  if (validatableInput.maxLength != null && typeof validatableInput.value === 'string') {
    isValid = isValid && validatableInput.value.length <= validatableInput.maxLength;
  }
  if (validatableInput.min != null && typeof validatableInput.value === 'number') {
    isValid = isValid && validatableInput.value >= validatableInput.min;
  }
  if (validatableInput.max != null && typeof validatableInput.value === 'number') {
    isValid = isValid && validatableInput.value <= validatableInput.max;
  }
  return isValid;
}

//Component Base Class
abstract class Component <T extends HTMLElement, U extends HTMLElement>{
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element: U;

  constructor(
    templateId: string,
    hostElementId: string,
    insertAtStart: boolean,
    newElementId?: string,
    ){
      this.templateElement = document.getElementById(templateId)! as HTMLTemplateElement;
      this.hostElement = document.getElementById(hostElementId)! as T;

      const importedNode = document.importNode(this.templateElement.content, true);
      this.element = importedNode.firstElementChild as U;
      if(newElementId){
        this.element.id = newElementId;
      }
      this.attach(insertAtStart);
    }
    private attach(insertAtStart: boolean) {
      this.hostElement.insertAdjacentElement(insertAtStart ? "afterbegin" : "beforeend", this.element);
    }
    abstract configure(): void;
    abstract renderContent(): void;
}

class ProjectInput extends Component <HTMLDivElement, HTMLFormElement> {
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

class ProjectList extends Component <HTMLDivElement, HTMLElement>{
  assignedProjects: Project[];

  constructor(private type: 'active'| 'finished'){
    super('project-list', 'app', false, `${type}-projects`)

    this.assignedProjects = []

    this.configure();
    this.renderContent();
  }
  private renderProjects() {
    const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
    listEl.innerHTML = '';
    for (const prjItem of this.assignedProjects) {
      const listItem = document.createElement('li');
      listItem.textContent = prjItem.title;
      listEl.appendChild(listItem);
    }
  }
  configure() {
    projectState.addListener((projects: Project []) => {
      const relevantProjects = projects.filter(prj => {
        if(this.type === 'active') {
          return prj.status === ProjectStatus.active
        }
        return prj.status === ProjectStatus.finished
      })
      this.assignedProjects = relevantProjects;
      this.renderProjects();
    })
  }
  renderContent() {
    const listId= `${this.type}-projects-list`;
    this.element.querySelector('ul')!.id = listId;
    this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS'
  }
}

const projectInput = new ProjectInput();
const activePrjList = new ProjectList('active');
const finishedPrjList = new ProjectList('finished');