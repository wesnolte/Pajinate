;(function($){
/*******************************************************************************************/	
// jquery.pajinate.js - version 0.2
// A jQuery plugin for paginating through any number of DOM elements
// 
// Copyright (c) 2010, Wes Nolte (http://wesnolte.com)
// Liscensed under the MIT License (MIT-LICENSE.txt)
// http://www.opensource.org/licenses/mit-license.php
// Created: 2010-04-16 | Updated: 2010-04-26
/*******************************************************************************************/

	$.fn.pajinate = function(options){
		// Set some state information
		var current_page = 'current_page';
		var items_per_page = 'items_per_page';
		
		var meta;
	
		// Setup default option values
		var defaults = {
			item_container_id : '.content',
			items_per_page : 10,			
			nav_panel_id : '.page_navigation',
			num_page_links_to_display : 20,			
			start_page : 0,
			nav_label_first : 'First',
			nav_label_prev : 'Prev',
			nav_label_next : 'Next',
			nav_label_last : 'Last'
		};
		var options = $.extend(defaults,options);
		var $item_container;
		var $page_container;
		var $items;
		var $nav_panels;
	
		return this.each(function(){
			$page_container = $(this);
			$item_container = $(this).find(options.item_container_id);
			$items = $page_container.find(options.item_container_id).children();
			meta = $page_container;
			
			// Initialise meta data
			meta.data(current_page,0);
			meta.data(items_per_page, options.items_per_page);
					
			// Get the total number of items
			var total_items = $item_container.children().size();
			
			// Calculate the number of pages needed
			var number_of_pages = Math.ceil(total_items/options.items_per_page);
			
			// Construct the nav bar
			var more = '<span class="ellipse more">...</span>';
			var less = '<span class="ellipse less">...</span>';
			
			var navigation_html = '<a class="first_link" href="">'+ options.nav_label_first +'</a>';
			navigation_html += '<a class="previous_link" href="">'+ options.nav_label_prev +'</a>'+ less;
			var current_link = 0;
			while(number_of_pages > current_link){
				navigation_html += '<a class="page_link" href="" longdesc="' + current_link +'">'+ (current_link + 1) +'</a>';
				current_link++;
			}
			navigation_html += more + '<a class="next_link" href="">'+ options.nav_label_next +'</a>';
			navigation_html += '<a class="last_link" href="">'+ options.nav_label_last +'</a>';
			
			// And add it to the appropriate area of the DOM	
			$nav_panels = $page_container.find(options.nav_panel_id);			
			$nav_panels.html(navigation_html).each(function(){
			
				$(this).find('.page_link:first').addClass('first');
				$(this).find('.page_link:last').addClass('last');
				
			});
			
			// Hide the more/less indicators
			$nav_panels.children('.ellipse').hide();
			
			// Set the active page link styling
			$nav_panels.find('.previous_link').next().next().addClass('active_page');
			
			/* Setup Page Display */
			// And hide all pages
			$items.hide();
			// Show the first page			
			$items.slice(0, meta.data(items_per_page)).show();

			/* Setup Nav Menu Display */
			// Page number slices
			
			var total_page_no_links = $page_container.children(options.nav_panel_id+':first').children('.page_link').size();
			options.num_page_links_to_display = Math.min(options.num_page_links_to_display,total_page_no_links);

			$nav_panels.children('.page_link').hide(); // Hide all the page links
			
			// And only show the number we should be seeing
			$nav_panels.each(function(){
				$(this).children('.page_link').slice(0, options.num_page_links_to_display).show();			
			});
			
			/* Bind the actions to their respective links */
			 
			// Event handler for 'First' link
			$page_container.find('.first_link').click(function(e){
				e.preventDefault();
				
				movePageNumbersRight($(this),0);
				goto(0);				
			});			
			
			// Event handler for 'Last' link
			$page_container.find('.last_link').click(function(e){
				e.preventDefault();
				var lastPage = total_page_no_links - 1;
				movePageNumbersLeft($(this),lastPage);
				goto(lastPage);				
			});			
			
			// Event handler for 'Prev' link
			$page_container.find('.previous_link').click(function(e){
				e.preventDefault();
				showPrevPage($(this));
			});
			
			
			// Event handler for 'Next' link
			$page_container.find('.next_link').click(function(e){
				e.preventDefault();				
				showNextPage($(this));
			});
			
			// Event handler for each 'Page' link
			$page_container.find('.page_link').click(function(e){
				e.preventDefault();
				goto($(this).attr('longdesc'));
			});			
			
			// Goto the required page
			goto(parseInt(options.start_page));
			toggleMoreLess();
		});
		
		function showPrevPage(e){
			new_page = parseInt(meta.data(current_page)) - 1;						
			
			// Check that we aren't on a boundary link
			if($(e).siblings('.active_page').prev('.page_link').length==true){
				movePageNumbersRight(e,new_page);
				goto(new_page);
			}
				
		};
			
		function showNextPage(e){
			new_page = parseInt(meta.data(current_page)) + 1;
			
			// Check that we aren't on a boundary link
			if($(e).siblings('.active_page').next('.page_link').length==true){		
				movePageNumbersLeft(e,new_page);
				goto(new_page);
			}
				
		};
			
		function goto(page_num){
			
			var ipp = meta.data(items_per_page);
			
			var isLastPage = false;
			
			// Find the start of the next slice
			start_from = page_num * ipp;
			
			// Find the end of the next slice
			end_on = start_from + ipp;
			// Hide the current page	
			$items.hide()
					.slice(start_from, end_on)
					.show();
			
			// Reassign the active class
			$page_container.find(options.nav_panel_id).children('.page_link[longdesc=' + page_num +']').addClass('active_page')
													 .siblings('.active_page')
													 .removeClass('active_page');										 
			
			// Set the current page meta data							
			meta.data(current_page,page_num);
			
			// Hide the more and/or less indicators
			toggleMoreLess();
		};	
		
		// Methods to shift the diplayed index of page numbers to the left or right
		function movePageNumbersLeft(e, new_p){
			var new_page = new_p;
			
			var $current_active_link = $(e).siblings('.active_page');
		
			if($current_active_link.siblings('.page_link[longdesc=' + new_page +']').css('display') == 'none'){
				
				$nav_panels.each(function(){
							$(this).children('.page_link')
								.hide() // Hide all the page links
								.slice(parseInt(new_page - options.num_page_links_to_display + 1) , new_page + 1)
								.show();		
							});
			}
			
		} 
		
		function movePageNumbersRight(e, new_p){
			var new_page = new_p;
			
			var $current_active_link = $(e).siblings('.active_page');
			
			if($current_active_link.siblings('.page_link[longdesc=' + new_page +']').css('display') == 'none'){
												
				$nav_panels.each(function(){
							$(this).children('.page_link')
								.hide() // Hide all the page links
								.slice( new_page , new_page + parseInt(options.num_page_links_to_display))
								.show();
							});
			}
		}
		
		// Show or remove the ellipses that indicate that more page numbers exist in the page index than are currently shown
		function toggleMoreLess(){
													 
			if(!$nav_panels.children('.page_link:visible').hasClass('last')){					
				$nav_panels.children('.more').show();
			}else {
				$nav_panels.children('.more').hide();
			}
			
			if(!$nav_panels.children('.page_link:visible').hasClass('first')){
				$nav_panels.children('.less').show();
			}else {
				$nav_panels.children('.less').hide();
			}			
		}
		
	};
	
})(jQuery);