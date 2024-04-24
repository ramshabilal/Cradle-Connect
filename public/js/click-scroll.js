//jquery-click-scroll
//by syamsul'isul' Arifin

var sectionArray = [1, 2, 3, 4, 5];

$.each(sectionArray, function(index, value){
          
     $(document).scroll(function(){
         var offsetSection = $('#' + 'section_' + value).offset().top - 75;
         var docScroll = $(document).scrollTop();
         var docScroll1 = docScroll + 1;
     });
    
    $('.click-scroll').eq(index).click(function(e){
        var offsetClick = $('#' + 'section_' + value).offset().top - 75;
        e.preventDefault();
        $('html, body').animate({
            'scrollTop':offsetClick
        }, 300)
    });
    
});


document.addEventListener('DOMContentLoaded', function () {
    const moodButtons = document.querySelectorAll('.mood-btn');
  
    moodButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        // Remove the 'selected' class from all mood buttons
        moodButtons.forEach(function (btn) {
          btn.classList.remove('selected');
        });
  
        // Add the 'selected' class to the clicked mood button
        button.classList.add('selected');
  
        // Set the value of the hidden input field to the selected mood
        const selectedMood = button.getAttribute('data-mood');
        document.getElementById('mood').value = selectedMood;
      });
    });
  });
  