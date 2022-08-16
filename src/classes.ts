class Department {
   
   private employees: string[] = [];

   constructor (private id: string, public name: string){
      this.id = id;
      this.name = name;
   }

   describe() {
    console.log(`Department: ${this.name} and ${this.id}`);
   }

    addEmployee(employee: string) {
      this.employees.push(employee);
    }

    printEmployeeInformation() {
      console.log(this.employees.length);
      console.log(this.employees);
    }
}

class ITDepartment extends Department {

  constructor(id: string, private admins: string[]) {
    super(id, 'IT');
    this.admins = admins;
  }
}

const IT = new Department('2', 'IT');
IT.addEmployee('John');

IT.printEmployeeInformation();

IT.describe();