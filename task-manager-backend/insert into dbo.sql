insert into dbo.Designation
    (Designation)
values
    ('CEO');
select *
from dbo.Designation;
insert into dbo.Designation
    (Designation)
values
    ('SDE I');

insert into dbo.Department
    (Department)
values
    ('Engineering');
select *
from dbo.Department;

insert into dbo.EmployeeMaster
    (Id, EmployeeId, EmployeeName, DesignationId)
values
    (1, 1, 'Mr. CEO', 1);

insert into dbo.EmployeeMaster
    (Id, EmployeeId, EmployeeName, DepartmentId, DesignationId)
values
    (2, 2, 'A', 1, 2);

select *
from dbo.EmployeeMaster;


insert into dbo.Login
    (EmpId, Password)
values
    (1, 1234);
insert into dbo.Login
    (EmpId, Password)
values
    (2, 7890);
select *
from dbo.Login;