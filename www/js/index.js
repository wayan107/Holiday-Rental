/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var ajaxUrl = 'https://www.rajavila.com/app/';
//var ajaxUrl = 'http://localhost/holidayrental/'; 

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
		
		//only for check on desktop
		app.checkAuth();
		app.receivedEvent();
		
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        //app.receivedEvent('deviceready');
		app.checkAuth();
		app.receivedEvent();
		//app.loadIncludedPage();
		
    },
    // Update DOM on a Received Event
    receivedEvent: function() {
       /*  var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id); */
		
		$('#login-form').submit(function(e){
			e.preventDefault();
			app.login();
		});
		
		$('ul.menu li').click(function(){
			app.loadPage($(this).data('content'));
		});
    },
	
	checkAuth: function(){
		//console.log(localStorage.loginToken);
		if(localStorage.loginToken && localStorage.userID){
			app.addLoadingLayer();
			$.ajax({
				type	: 'GET',
				url		: ajaxUrl,
				data	: {'r': 'checkAuth', 'loginToken': localStorage.loginToken},
				success	: function(e){
					if(e){
						app.loadPage('progress');
						$('ul.menu').show();
						app.setupPush();
					}else{
						$('#login-content').show();
					}
					
					app.removeLoadingLayer();
				},
				error: function(e){
					console.log(e);
				}
			});
		}else{
			$('#login-content').show();
			//console.log('masuk');
		}
	},
	
	showTab: function(wrapper, target){
		//wrapper = $('#'+wrapper);
		wrapper.find('.tab-content').hide();
		wrapper.find('#'+target).show();
	},
	
	bindTabFunction: function(page, bindTab){
		bindTab = typeof bindTab !== 'undefined' ? bindTab : true;
		
		if($('ul.tab').length){
			var wrapper = $('#' + page + '-content'),
				tab = wrapper.find('ul.tab');
				
			//console.log($('#'+tab.find('li:first-child').data('target')));
			wrapper.find('#'+tab.find('li:first-child').data('target')).show();
			//console.log(wrapper);
			
			if(bindTab){
				tab.find('li').unbind().click(function(){
					app.showTab(wrapper, $(this).data('target'));
				});
			}
		}
	},
	
	showPage: function(page){
		/* $('div[data-include]').each(function() {
			$(this).load( $(this).attr('data-include') + '.html').trigger('create');
			console.log('masuk : ' + $(this).attr('data-include'));
		}); */
		$('.menu-content').hide();
		$('#' + page + '-content').show();
		
		$('ul.menu li').removeClass('active');
		$('ul.menu li[data-content="'+page+'"]').addClass('active');
	},
	
	loadPage: function(page){
		
		if($('#' + page + '-content').length){
			app.showPage(page);
		}else{
			//console.log(localStorage.userID);
			app.addLoadingLayer();
			$.ajax({
				type	: 'GET',
				url		: ajaxUrl,
				data	: {'r': page, 'loginToken': localStorage.loginToken, 'uid': localStorage.userID },
				success	: function(e){
					$('.content').append(e);
					app.showPage(page);
					
					if(page == 'profit-lost'){
						$('#profit-lost-filter').submit(function(e){
							e.preventDefault();
							app.filterProfitLost();
						});
					}
					
					if(page == 'calendar'){
						app.bindCalendarListings();
					}
					
					app.bindTabFunction(page);
					app.bindLinks();
					
					app.removeLoadingLayer();
				}
			});
		}
	},
	
	filterProfitLost: function(){
		//console.log(localStorage.userID);
		app.addLoadingLayer();
		var ajaxData = {
						'r'				: 'profit-lost',
						'loginToken'	: localStorage.loginToken,
						'uid'			: localStorage.userID,
						'month'			: $('#month').val(),
						'year'			: $('#year').val(),
						'table_only'	: true,
					};
					
		$.ajax({
			type	: 'GET',
			url		: ajaxUrl,
			data	: ajaxData,
			success	: function(e){
				$('#profit-lost-table').html(e);
				app.bindTabFunction('profit-lost', false);
				app.removeLoadingLayer();
			}
		});
	},
	/* loadProgress: function(){
		console.log(localStorage.userID);
		$.ajax({
			type	: 'GET',
			url		: ajaxUrl,
			data	: {'r': 'progress', 'loginToken': localStorage.loginToken, 'uid': localStorage.userID },
			success	: function(e){
				$('.content').append(e);
				app.showPage('progress-content');
			}
		});
	},
	
	loadPorfitLost: function(){
		$.ajax({
			type	: 'GET',
			url		: ajaxUrl,
			data	: {'r': 'progress', 'loginToken': localStorage.loginToken, 'uid': localStorage.userID },
			success	: function(e){
				$('.content').append(e);
				app.showPage('profit-lost-content');
			}
		});
	}, */
	
	login: function(){
		app.addLoadingLayer();
		$.ajax({
			type	: 'GET',
			url		: ajaxUrl,
			data	: {'r': 'login', 'u': $('#username').val(), 'p': $('#password').val()},
			success	: function(e){
				console.log(e);
				var result = JSON.parse(e);
				if(result['response'] == '200'){
					localStorage.loginToken = result['token'];
					localStorage.userID = result['user_id'];
					app.setupPush();
					
					$('.menu-content').hide();
					app.loadPage('progress');
					$('ul.menu').show();
				}else{
					$('#login-msg').html(result['message']).addClass('error');
				}
				
				app.removeLoadingLayer();
			}
		});
	},
	
	calendarPageLoader: function(target){
		$('.calendar-inner').hide();
		$('#'+target).show();
	},
	
	bindCalendarListings: function(){
		$('#listings li').click(function(){
			var target = $(this).data('target'),
				listingID = $(this).data('listingid');
			
			if($('#'+target).length){
				app.calendarPageLoader(target);
			}else{
				app.addLoadingLayer();
				$.ajax({
					url		: ajaxUrl,
					type	: 'GET',
					data	: {'r': 'calendar_list', 'loginToken': localStorage.loginToken, 'uid': localStorage.userID, 'listing_id': listingID },
					success	: function(e){
						$('#calendar-content').append(e);
						app.calendarPageLoader(target);
						app.bindBackToBookingList();
						app.bindSelectDates(listingID);
						app.bindBlockDateButton(listingID);
						app.removeLoadingLayer();
					}
				});
			}
		});
	},
	
	bindBackToBookingList: function(){
		$('.back-to-booking-list').click(function(){
			app.calendarPageLoader('booking-list');
		});
	},
	
	bindSelectDates: function(listingID){
		$('#calendar-list-' + listingID).find('td.date').unbind().click(function(){
			if(!$(this).hasClass('blocked') || $(this).hasClass('owner-stay')){
				if($(this).hasClass('selected')){
					$(this).removeClass('selected');
				}else{
					$(this).addClass('selected');
				}
				
				app.openDateBlockingPanel(listingID);
			}
		});
	},
	
	openDateBlockingPanel: function(listingID){
		var calendarInner = $('#calendar-list-' + listingID),
			panelBlock = calendarInner.find('#date-block-panel-' + listingID);
		
		if(calendarInner.find('td.selected').length && !panelBlock.is(':visible')){
			panelBlock.slideDown();
			calendarInner.css('padding-top', '64px');
		}else if(!calendarInner.find('td.selected').length && panelBlock.is(':visible')){
			panelBlock.slideUp();
			calendarInner.css('padding-top', '0px');
		}
	},
	
	bindBlockDateButton: function(listingID){
		$('#date-block-panel-' + listingID).click(function(){
			app.addLoadingLayer();
			
			var calendarInner = $('#calendar-list-' + listingID);
			var dates = [],
				tmpDates = [],
				session = 0,
				prevDate = 0,
				index = 0;
				
			calendarInner.find('td.selected').each(function(){
				var thedate = parseInt($(this).html());
				
				if(prevDate > 0){
					var selisih = thedate - prevDate;
					if(Math.abs(selisih) > 1){
						dates[session] = tmpDates;
						tmpDates = [];
						session++;
						index = 0;
					}
				}
				
				prevDate = thedate;
				tmpDates[index] = $(this).data('date');
				
				index++;
			});
			
			dates[session] = tmpDates;
			
			$.ajax({
				url		: ajaxUrl,
				type	: 'GET',
				data	: {'r': 'owner_block_calendar', 'loginToken': localStorage.loginToken, 'dates': dates, 'listing_id': listingID },
				success	: function(e){
					var result = e.split('|');
					if(result[1] == '1'){
						calendarInner.find('td.selected').unbind().addClass('blocked owner-stay').removeClass('selected');
						calendarInner.find('#date-block-panel-' + listingID).slideUp();
					}
					
					alert(result[0]);
					app.removeLoadingLayer();
				}
			});
		});
	},
	
	addLoadingLayer: function(){
		var html = '<div class="loader-wrapper"></div>';
		$('body').append('<div class="loader-wrapper"><img src="img/spinner.gif"></div>');
	},
	
	removeLoadingLayer: function(){
		$('.loader-wrapper').remove();
	},
	
	bindLinks: function(){
		$('a').click(function(e){
			e.preventDefault();
			var href = $(this).attr('href');
			if($(href != '#')){
				window.open(href);
			}
		});
	},
	setupPush: function() {
        console.log('calling push init');
        var push = PushNotification.init({
            "android": {
            },
            "browser": {},
            "ios": {
                "sound": true,
                "vibration": true,
                "badge": true
            },
            "windows": {}
        });
        console.log('after init');

        push.on('registration', function(data) {
            console.log('registration event: ' + data.registrationId);
			//alert(data.registrationId);
            var oldRegId = localStorage.getItem('registrationId');
            if (oldRegId !== data.registrationId) {
                // Save new registration ID
                localStorage.setItem('registrationId', data.registrationId);
                // Post registrationId to your app server as the value has changed
				
				$.ajax({
					url		: ajaxUrl,
					type	: 'GET',
					data	: {'r': 'save_messaging_id', 'loginToken': localStorage.loginToken, 'uid': localStorage.userID, 'registrationId': data.registrationId },
					success	: function(e){
						if(e == '1'){
							console.log('messaging id saved successfully');
						}else{
							console.log('failed to save messaging id');
						}
					}
				});
            }
			
			$.ajax({
					url		: ajaxUrl,
					type	: 'GET',
					data	: {'r': 'save_messaging_id', 'loginToken': localStorage.loginToken, 'uid': localStorage.userID, 'registrationId': data.registrationId },
					success	: function(e){
						console.log('msg save status: '+ e);
						if(e == 'success'){
							console.log('messaging id saved successfully');
						}else{
							console.log('failed to save messaging id');
						}
					}
				});

            /* var parentElement = document.getElementById('registration');
            var listeningElement = parentElement.querySelector('.waiting');
            var receivedElement = parentElement.querySelector('.received');

            listeningElement.setAttribute('style', 'display:none;');
            receivedElement.setAttribute('style', 'display:block;'); */
        });

        push.on('error', function(e) {
            console.log("push error = " + e.message);
        });

        push.on('notification', function(data) {
            console.log('notification event');
            navigator.notification.alert(
                data.message,         // message
                null,                 // callback
                data.title,           // title
                'Ok'                  // buttonName
            );
       });
    }
};

