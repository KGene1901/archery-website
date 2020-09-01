/* eslint-disable no-unused-vars */
/////////////////////////////////////////////////////////////////////////////
//      Default bootstrap template jquery functions to format page         //
////////////////////////////////////////////////////////////////////////////

// eslint-disable-next-line no-undef
jQuery(document).ready(function ($) {

  // Header fixed and Back to top button
  $(window).scroll(function () {
    if ($(this).scrollTop() > 100) {
      $('.back-to-top').fadeIn('slow');
      $('#header').addClass('header-fixed');
    } else {
      $('.back-to-top').fadeOut('slow');
      $('#header').removeClass('header-fixed');
    }
  });
  $('.back-to-top').click(function () {
    $('html, body').animate({
      scrollTop: 0
    }, 1500, 'easeInOutExpo');
    return false;
  });

  // Initiate the wowjs
  // eslint-disable-next-line no-undef
  new WOW().init();

  // Initiate superfish on nav menu
  $('.nav-menu').superfish({
    animation: {
      opacity: 'show'
    },
    speed: 400
  });

  // Mobile Navigation
  if ($('#nav-menu-container').length) {
    var $mobile_nav = $('#nav-menu-container').clone().prop({
      id: 'mobile-nav'
    });
    $mobile_nav.find('> ul').attr({
      'class': '',
      'id': ''
    });
    $('body').append($mobile_nav);
    $('body').prepend('<button type="button" id="mobile-nav-toggle"><i class="fa fa-bars"></i></button>');
    $('body').append('<div id="mobile-body-overly"></div>');
    $('#mobile-nav').find('.menu-has-children').prepend('<i class="fa fa-chevron-down"></i>');

    $(document).on('click', '.menu-has-children i', function (e) {
      $(this).next().toggleClass('menu-item-active');
      $(this).nextAll('ul').eq(0).slideToggle();
      $(this).toggleClass("fa-chevron-up fa-chevron-down");
    });

    $(document).on('click', '#mobile-nav-toggle', function (e) {
      $('body').toggleClass('mobile-nav-active');
      $('#mobile-nav-toggle i').toggleClass('fa-times fa-bars');
      $('#mobile-body-overly').toggle();
    });

    $(document).click(function (e) {
      var container = $("#mobile-nav, #mobile-nav-toggle");
      if (!container.is(e.target) && container.has(e.target).length === 0) {
        if ($('body').hasClass('mobile-nav-active')) {
          $('body').removeClass('mobile-nav-active');
          $('#mobile-nav-toggle i').toggleClass('fa-times fa-bars');
          $('#mobile-body-overly').fadeOut();
        }
      }
    });
  } else if ($("#mobile-nav, #mobile-nav-toggle").length) {
    $("#mobile-nav, #mobile-nav-toggle").hide();
  }

  // Smoth scroll on page hash links
  $('a[href*="#"]:not([href="#"])').on('click', function () {
    if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {

      var target = $(this.hash);
      if (target.length) {
        var top_space = 0;

        if ($('#header').length) {
          top_space = $('#header').outerHeight();

          if (!$('#header').hasClass('header-fixed')) {
            top_space = top_space - 20;
          }
        }

        $('html, body').animate({
          scrollTop: target.offset().top - top_space
        }, 1500, 'easeInOutExpo');

        if ($(this).parents('.nav-menu').length) {
          $('.nav-menu .menu-active').removeClass('menu-active');
          $(this).closest('li').addClass('menu-active');
        }

        if ($('body').hasClass('mobile-nav-active')) {
          $('body').removeClass('mobile-nav-active');
          $('#mobile-nav-toggle i').toggleClass('fa-times fa-bars');
          $('#mobile-body-overly').fadeOut();
        }
        return false;
      }
    }
  });

  // Porfolio filter
  $("#highlights-flters li").click(function () {
    $("#highlights-flters li").removeClass('filter-active');
    $(this).addClass('filter-active');

    var selectedFilter = $(this).data("filter");
    $("#highlights-wrapper").fadeTo(100, 0);

    $(".highlights-item").fadeOut().css('transform', 'scale(0)');

    setTimeout(function () {
      $(selectedFilter).fadeIn(100).css('transform', 'scale(1)');
      $("#highlights-wrapper").fadeTo(300, 1);
    }, 300);
  });

  // jQuery counterUp
  $('[data-toggle="counter-up"]').counterUp({
    delay: 10,
    time: 1000
  });

});

/////////////////////////////////////////////////////////////////////////////
//               Default template formatting ends here                     //
////////////////////////////////////////////////////////////////////////////


//////////////////////////////////////////////////
//      Displaying image sent from server       //
/////////////////////////////////////////////////
let divClass;
function imgCreate(tag, link, desc, tt){  // function that creates a complex image-inside-nested-divs object to be used in the webpage with a filter function 
  
  switch(tag){  // sets category of images based on the "tag" value from the json object retrived from server
    case "event":
      divClass = "col-lg-3 col-md-6 highlights-item filter-event";
      break;
    case "eq":
      divClass = "col-lg-3 col-md-6 highlights-item filter-eq";
      break;
    case "training":
      divClass = "col-lg-3 col-md-6 highlights-item filter-training";
  }

  const image1 = document.createElement('img');
  image1.setAttribute('src', link);
  image1.setAttribute('class', "imgToDisplay");
  image1.setAttribute('alt', desc);
  image1.setAttribute('id', "firstImg");
  image1.setAttribute('onclick', 'modalDisplay(this);');

  let wrapperDiv = document.getElementById('highlights-wrapper');

  const filterDiv = document.createElement('div');
  filterDiv.setAttribute('class', divClass);

  const detailDiv = document.createElement('div');
  detailDiv.setAttribute('class', "details");
  
  const title = document.createElement('h4');
  title.innerHTML = tt;

  wrapperDiv.append(filterDiv);
  filterDiv.append(image1);
  filterDiv.append(detailDiv);
  detailDiv.append(title);

}

window.addEventListener('load', async function(event){
  try {
    let response =  await fetch('http://127.0.0.1:8090/imgdir');
    let result =  await response.text();
    let jsondata = JSON.parse(result);

    for(let file of jsondata){
      imgCreate(file['tag'], file['url'], file['desc'], file['title']);
    }}
    catch (e) {
      alert("Global images are currently unobtainable due to server issues");
  }

});

//////////////////////////////////////////////////
//             End of function                  //
/////////////////////////////////////////////////


//////////////////////////////////////////////////
// Sending image uploaded to be saved on server //
/////////////////////////////////////////////////

document.getElementById('uploadPic').addEventListener('submit', async function(event){ 
  let formData = new FormData(document.getElementById('uploadPic'));
  let tag;
  if (document.getElementById("eq").checked == true || document.getElementById("event").checked == true || document.getElementById("training").checked == true){  // error-checking to ensure that one and only one radio button is checked before function is called
    try {
      event.preventDefault();
      let resp = await fetch('http://127.0.0.1:8090/imgUpload', {
        method: 'POST',
        body: formData
      });
      
      if (document.getElementById("eq").checked == true){
        tag = 'eq';
      } else if (document.getElementById("event").checked == true){
        tag = 'event';
      }else{
        tag = 'training';
      }

      imgCreate(tag,'./uploads/'+document.getElementById('user-image').files[0].name, document.getElementById('descr').value, document.getElementById('title').value);

    } catch (error) {
      alert("Post request unavailable due to server issue");
    }
  } else {
    alert('Please make a selection before continuing');
  }

});

//////////////////////////////////////////////////
//             End of function                  //
/////////////////////////////////////////////////


///////////////////////////////////////////////////
//   Modal box for picture display upon click    //
//////////////////////////////////////////////////

window.modalDisplay = function(img){  // creates a blow-up display box that showcases the image in a larger view along with a caption
  var modal1 = document.getElementById("picModal");
  var modalImg1 = document.getElementById("Img");
  var captionText1 = document.getElementById("caption");
    
  modal1.style.display = "block";
  modalImg1.src = img.src;
  captionText1.innerHTML = img.alt;

  var span1 = document.getElementsByClassName("close-1")[0];

  span1.onclick = function() { 
    modal1.style.display = "none";
  }};

///////////////////////////////////////////////////
//              End of function                  //
//////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////
//    Updating score boards and POST scores to server function    //
///////////////////////////////////////////////////////////////////

const table = document.querySelector('table');
const tbody = table.querySelector('tbody');
let button = document.getElementById('alert');
let score_form = document.getElementById('scoredata');

function createRows(name, bow, inout, score){ // creates a new row in the table with the newly added score 
  
  let tbody = document.getElementById('table_body');

  let trow = tbody.insertRow();
  let tdata1 = trow.insertCell(0);
  let tdata2 = trow.insertCell(1);
  let tdata3 = trow.insertCell(2);
  let tdata4 = trow.insertCell(3);

  tdata1.setAttribute('class', "name");
  tdata2.setAttribute('class', "bow");
  tdata2.setAttribute('class', "inout");
  tdata2.setAttribute('class', "score");

  tdata1.innerHTML = name;
  tdata2.innerHTML = bow;
  tdata3.innerHTML = inout;
  tdata4.innerHTML = score;
}

score_form.addEventListener('submit', async function(event){
    event.preventDefault();
  
    var name = document.getElementById('name').value;
    var bow = document.getElementById('bow').value;
    var inout = document.getElementById('inout').value;
    var score = document.getElementById('scores').value;

    if ((name.trim() != '') && (bow.trim()!='') && (inout.trim() != '') && (score!='')){
      createRows(name, bow, inout, score);
      var data = {"Name": name, "Bow": bow, "InOut": inout, "Score": score};
    
      try {
        let resp = await fetch('/newScoreData',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json;charset=utf-8'
          },
          body: JSON.stringify(data),
        });
        
      } catch (e) {
        alert("POST request currently unavailable due to server issue");
      }
  }else{
    alert('Please fill in all fields before continuing');
  } 
});

//////////////////////////////////////////
//         End of function              //
/////////////////////////////////////////



//////////////////////////////////////////
//       GET scores from server         //
/////////////////////////////////////////

window.addEventListener('load', async function(event){
  try {
    let response =  await fetch('http://127.0.0.1:8090/scoreData');
    let result =  await response.text();
    let jsondata = JSON.parse(result);

    for (let x of jsondata){
      createRows(x['Name'], x['Bow'], x['InOut'], x['Score']);
    }

  
  } catch (e) {
    alert("Global scores are currently unavailable due to server issues");
  }

});

//////////////////////////////////////////
//         End of function              //
/////////////////////////////////////////



//////////////////////////////////////////
// Searching for archery event function //
/////////////////////////////////////////

var form = document.getElementById('event_search');

form.addEventListener('submit', async function(event){
  var s1 = document.getElementById('timeline').value;
  var s2 = document.getElementById('location').value;

  try{
      event.preventDefault();

      let keyword = document.getElementById('keyword').value;
      let response = await fetch('http://127.0.0.1:8090/search?keyword=' + keyword + '&time=' + s1 + '&loc=' + s2); // get request using parameters 
      let body = await response.text();
      let resultDiv = document.getElementById('event_list');
      if (body.startsWith('[')){
        let results = JSON.parse(body);
        results.innerHTML = body;
        let resultHTML = "";

        for (let result of results){
            resultHTML+= `<div class='tt'> ${result.title} <span class='tooltiptext'> Date: ${result.date} <br> Location: ${result.location} </span> </div> <br> `;
        }

        resultDiv.innerHTML = resultHTML; // using innerHTML here instead of creating new element and appending as the idea for this function is to refresh (overwrite) the result being displayed every time a user searches for something new
    } else{
      resultDiv.innerHTML = body;
    }
  }
  catch(e){
    alert("Our server is currently experiencing some issues with: "+ ' ' + e + '.' + 'Please wait and try again later!');
  }
    
});

//////////////////////////////////////////
//          End of function             //
/////////////////////////////////////////


//////////////////////////////////////////
//      Displaying customer queries     //
/////////////////////////////////////////

let marqdiv = document.getElementById('question-div');
let fullsect = ''
let detailsect = ''

window.addEventListener('load', async function(event){
  try {
    let response =  await fetch('http://127.0.0.1:8090/customerquery');
    let result =  await response.text();
    let jsondata = JSON.parse(result);
    
    for (let query of jsondata){
      detailsect += `<a href="mailto:${query.email}?Subject=Answer%20To%20Your%20Question"> ${query.name} </a> asks: <br> ${query.msg} <br><br>`
    }

    fullsect = `<marquee id="querylist" scrollamount="3" direction="up">`+ detailsect + `</marquee>`
    marqdiv.innerHTML = fullsect;
  
  } catch (e) {
    alert("Global scores are currently unavailable due to server issues");
  }

});

//////////////////////////////////////////
//          End of function             //
/////////////////////////////////////////


//////////////////////////////////////////
//       Sending customer queries       //
/////////////////////////////////////////

document.getElementById('contactForm').addEventListener('submit', async function(event){
  event.preventDefault();

  var user = document.getElementById('username').value;
  var email = document.getElementById('email').value;
  var subject = document.getElementById('subject').value;
  var message = document.getElementById('msg').value;

  if ((user.trim() != '') && (subject.trim()!='') && (email.trim()!='') && (message.trim() != '')) {
    var data = {"name": user, "email": email, "subject": subject, "msg": message};
  
    try {
      let resp = await fetch('/newUserQuery',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(data),
      });
      
      
    } catch (e) {
      alert("POST request currently unavailable. Server might be done :(" );
    }

    detailsect += `<a href="mailto:${email}?Subject=Answer%20To%20Your%20Question"> ${user} </a> asks: <br> ${message} <br><br>`
    fullsect = `<marquee scrollamount="3" id="querylist" direction="up">`+ detailsect + `</marquee>`
    marqdiv.innerHTML = fullsect;

    if(document.getElementsByClassName('alert-simple alert-success')[0].id == 'hide'){
      document.getElementsByClassName('alert-simple alert-success')[0].id = 'show';
    }

    setTimeout(function(){
      if(document.getElementsByClassName('alert-simple alert-success')[0].id == 'show'){
        document.getElementsByClassName('alert-simple alert-success')[0].id = 'hide';
      }
    }, 3000);
    
}else{
  alert('Please fill in all fields before continuing');
} 
});

//////////////////////////////////////////
//          End of function             //
/////////////////////////////////////////