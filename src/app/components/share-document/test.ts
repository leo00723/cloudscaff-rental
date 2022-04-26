// {
//   try {
//     this.loading = true;
//     const statement: Statement = this.data.doc.statement;
//     const company: Company = this.data.doc.company;
//     const link = `https://app.cloudscaff.com/viewStatement/${company.id}-${statement.id}`;
//     const email = this.form.value;
//     const cc = email.cc.map((e) => e.email);
//     const emailData = {
//       to: email.email,
//       cc: cc.length > 0 ? cc : '',
//       template: {
//         name: 'share',
//         data: {
//           title: `Hey ${statement.customer.name}, ${company.name} has sent you a Statement.`,
//           message: '',
//           btnText: 'View Statement',
//           link,
//           subject: `${company.name} Statement - ${statement.code}`,
//         },
//       },
//     };
//     await this.masterSvc
//       .edit()
//       .setDoc(
//         'sharedStatements',
//         { ...this.data.doc, cc, email },
//         `${company.id}-${statement.id}`
//       );
//     await this.masterSvc
//       .edit()
//       .addDocument('mail', JSON.parse(JSON.stringify(emailData)));
//     this.form.reset();
//     this.masterSvc
//       .notification()
//       .toast('Statement shared successfully', 'success');
//     this.close();
//     this.loading = false;
//   } catch (error) {
//     console.error(error);
//     this.masterSvc
//       .notification()
//       .toast('Something went wrong! Please try again', 'danger');
//     this.loading = false;
//   }
// }
