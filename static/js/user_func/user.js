

document.addEventListener('DOMContentLoaded', function() {
  const buttons = document.querySelectorAll('.page-button');

  buttons.forEach(button => {
    button.addEventListener('click', function() {
      const page = this.getAttribute('data-page');
      console.log(page)
      window.location.href = `/${page}`;
    });
  });
});