// {
//   try {
//     this.loading = true;
//     const bulkEstimate: BulkEstimate = this.data.doc.bulkEstimate;
//     const company: Company = this.data.doc.company;
//     const link = `https://app.cloudscaff.com/viewBulkEstimate/${company.id}-${bulkEstimate.id}`;
//     const email = this.form.value;
//     const cc = email.cc.map((e) => e.email);
//     const emailData = {
//       to: email.email,
//       cc: cc.length > 0 ? cc : '',
//       template: {
//         name: 'share',
//         data: {
//           title: `Hey ${bulkEstimate.customer.name}, ${company.name} has sent you a Estimate.`,
//           message: '',
//           btnText: 'View Estimate',
//           link,
//           subject: `${company.name} Estimate - ${bulkEstimate.code}`,
//         },
//       },
//     };
//     await this.masterSvc
//       .edit()
//       .setDoc(
//         'sharedBulkEstimates',
//         { ...this.data.doc, cc, email },
//         `${company.id}-${bulkEstimate.id}`
//       );
//     await this.masterSvc
//       .edit()
//       .addDocument('mail', JSON.parse(JSON.stringify(emailData)));
//     this.form.reset();
//     this.masterSvc
//       .notification()
//       .toast('Estimate shared successfully', 'success');
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
