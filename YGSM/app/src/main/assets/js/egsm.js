var baseUrl = 'http://yg.shaiii.com';
var fileUrl = 'http://www.egousm.com';
$(document).ready(function() {
	$.ajaxSetup({
	    beforeSend: function(xhr, options) {
	        if(options.url.indexOf("baidu") == -1){
	            options.url = baseUrl + options.url;
	        }
	    }
	})


	function loginSuccess(data){
		localStorage.authFail = 0;
		if(data) localStorage.user = data;
		showInfo();
		$('.login').modal('hide');
	}

	function showInfo(){
		if(localStorage.user){
			info = JSON.parse(localStorage.user);
			$(".username").text( (info.cnname == "" ? info.username : info.cnname ) );
			if(info.avatar){
				$(".circle-avatar").text('').css({'background-image':"url('"+ info.avatar +"')", 'background-size': '60px 60px', 'background-repeat': 'no-repeat', 'background-position': 'center'});
			}
			
		}
	}

	function getInfo(){
		$.get('/user', function(data){
			if(data){ 
			        localStorage.user = data;
				showInfo();
			}
		})
	}

	function updateToken(){
		$.get('/token', function(data){
			$('meta[name="csrf-token"]').attr('content', data);
        		$.ajaxSetup({
        			headers: {
        			'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        			}
        		});
		});
	}

	function refreshCaptcha(){
		$(".captcha-img").attr('src', baseUrl+'/captcha');
	}

	function init(){
		if($(".username").length){
			updateToken();
			showInfo();
			//getInfo();
		}
	}

    $.ajaxSetup({
        headers: {
        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        }
    });

	init();

	if($("input[name='search']")){
        	$.get('/api/hotSearch',function(data){
			html = '';
        	        $.each(data, function(i, v){
				html += '<li><a href="./search.html?search='+decodeURIComponent(v.key_words)+'">'+decodeURIComponent(v.key_words)+'</a></li>';		
			});
			$(".hot-list").html(html);
        	});
	}

	$(".goback").click(function(e){
		window.history.back();
		e.preventDefault();	
	});

	$(".require-auth a").click(function(e){
		if(!localStorage.user){
			$(".login").modal('show');
			e.preventDefault();
		}
	});

    $("img.captcha-img").attr('src', baseUrl+'/captcha');

	$(".refresh").click(function(){
		refreshCaptcha();
	});

	$('[data-toggle="tooltip"]').tooltip({trigger:'manual', template:'<div class="tooltip" role="tooltip"><div class="tooltip-inner"></div></div>'});

	$(".login-form").submit(function(event){
		var $btn = $(this).find(":submit").button('loading');
		$.post('/login',$(this).serialize(), function(data){
			if(data){
				if(data.code == 1){
					loginSuccess(data.msg);
				}else{
					$(".login-form :submit").attr('data-original-title', data.msg).tooltip('show').on('shown.bs.tooltip', function () {
						setTimeout(function(){ $(".login-form :submit").tooltip('hide'); }, 1500);
					});
					if(data.code == 2){
						localStorage.authFail = localStorage.authFail ? (parseInt(localStorage.authFail) + 1) : 1;

						if(localStorage.authFail >= 3){
							refreshCaptcha();
							$(".login-captcha").css('display', 'block');
						}
					}	
				}
			}
		}).always(function(){
			$btn.button('reset');
		});
		event.preventDefault();
	});

	$(".register-form").submit(function(event){
		if($(".register-form :password[name='confirm']").val().length < 8 ){
			$(".register-form :submit").attr('data-original-title', '密码最少8位').tooltip('show').on('shown.bs.tooltip', function () {
				setTimeout(function(){ $(".register-form :submit").tooltip('hide'); }, 1500);
			});	
		}else{
			var $btn = $(this).find(":submit").button('loading');
			$.post('/regist',$(this).serialize(), function(data){
				if(data){
					if(data.code == 1){
						loginSuccess(data.msg);
					}else if(data.code != 1){
						$(".register-form :submit").attr('data-original-title', data.msg).tooltip('show').on('shown.bs.tooltip', function () {
							setTimeout(function(){ $(".register-form :submit").tooltip('hide'); }, 1500);
						});	
					}
				}
			}).always(function(){
				$btn.button('reset');
			});
		}
		event.preventDefault();
	});

        $(".info-form").submit(function(event){
                var $btn = $(this).find(":submit").button('loading');
                $.post('/info',$(this).serialize(), function(data){
                        if(data){
                                $(".info-form :submit").attr('data-original-title', data.msg).tooltip('show').on('shown.bs.tooltip', function () {
                                        setTimeout(function(){ $(".info-form :submit").tooltip('hide'); }, 1500);
                                });
                        }
                }).always(function(){
                        $btn.button('reset');
                });
                event.preventDefault();
        });
        $(".info-form input, .info-form select").change(function(){
                $(".btn-info").css('display', 'inline-block');

        });

        $(".login-form input").keyup(function(){
                if( $(".login-form input[name='username']").val() != '' &&  $(".login-form input[name='password']").val() != '' && $(".login-form input[name='captcha']").val() != ''){
                        $(".login-form :submit").removeAttr("disabled");
                }else{
                        $(".login-form :submit").attr("disabled", 'disabled');
                }
        });

        $(".register-form input").keyup(function(){
                if( $(".register-form input[name='username']").val() != '' &&  $(".register-form input[name='password']").val() != '' && $(".register-form input[name='confirm']").val() != '' && $(".register-form input[name='captcha']").val() != ''){
                        $(".register-form :submit").removeAttr("disabled");
                }else{
                        $(".register-form :submit").attr("disabled", 'disabled');
                }
        });


	var loginSwiper;
    	var swiper = new Swiper('.catalog-swiper', {
    	    pagination: '.swiper-pagination',
    	    paginationClickable: true
    	});

	$('.modal.login').on('show.bs.modal', function (e) {
		//updateToken();
	});

	$('.modal.login').on('shown.bs.modal', function (e) {
		setTimeout(function(){
			if(loginSwiper == null)
    			loginSwiper = new Swiper('.login-swiper', {
			        scrollbar: '.swiper-scrollbar',
        			scrollbarHide: false,
        			slidesPerView: 'auto',
        			centeredSlides: true,
        			spaceBetween: 30,
        			grabCursor: true
    			});

		}, 300);
	});

	$(".search .close").click(function(e){
		$("#bs-example-navbar-collapse-1").removeClass("in");
		e.preventDefault();
	});

	$(".search form").submit(function(e){
		window.location.href = './search.html?search='+$(this).find("input[name='search']").val();
		e.preventDefault();
	});

	$(".search input").bind('update', function(){
		var h = localStorage.history ? JSON.parse( localStorage.history ) : [];
		h.unshift( $(this).val() );
		h = h.slice(0,3);
		localStorage.history = JSON.stringify( h );
	})

	$($('.search input').attr('data-target')).on('show.bs.collapse', function () {
		var h = localStorage.history ? JSON.parse( localStorage.history ) : [];
		var list = '';
		$.each(h, function(i, v){
			list += '<li><a href="./search.html?search=/'+v+'">'+v+'</a></li>';
		});	
		$('.history-search ul').html(list);
	});

	if($('.search input').val() != ''){
		$('.search input').trigger('update');
	}

	//$(".navbar-fixed-bottom .login").css('height', ($(window).height()+'px' );

	$("#login").click(function(){
		loginSwiper.slideTo(0, 300, function(){});		
	});
	$("#regist").click(function(){
		loginSwiper.slideTo(1, 300, function(){});		
	});

	$(".info-form input").keydown(function(){
		$(".info-form :submit").css('display', 'inline-block');
	});

	$(".info-form select").change(function(){
		$(".info-form :submit").css('display', 'inline-block');
	});

	$(".favour").click(function(e){
		if($(".favour span").hasClass("glyphicon-heart-empty")){
			$(".favour span").removeClass('glyphicon-heart-empty').addClass('glyphicon-heart');
		}else{
			$(".favour span").removeClass('glyphicon-heart').addClass('glyphicon-heart-empty');
		}
		$.post('/favorite', {aid: $(this).attr('value')}, function(data){
			if(data){
				if(data.code == 1){
					$(".favour span").removeClass('glyphicon-heart-empty').addClass('glyphicon-heart');
				}else if( data.code == 3){
					$(".favour span").removeClass('glyphicon-heart').addClass('glyphicon-heart-empty');
				}
				$(".panel-heading[data-toggle='tooltip']").attr('data-original-title', data.msg).tooltip('show').on('shown.bs.tooltip', function () {
					setTimeout(function(){ $(".panel-heading[data-toggle='tooltip']").tooltip('hide'); }, 1500);
				});
			}	
		});	
		e.preventDefault();
	});
});

