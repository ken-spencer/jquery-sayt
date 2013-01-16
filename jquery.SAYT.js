/*------------------------------------*\
    Search as You Type
\*------------------------------------*/
/*
*   A click event can be attached to this object using jQuery to handle what happens when clicked
*/
function SAYT(selector, options, selectAction)
{
    this.options = {
        "url" : null,
        "fieldName" : "keywords",
        "data" : {},
        "id" : "sayt-cont",
        "showNoResults" : true
    }

    if (options) {
        this.options = $.extend(true, this.options, options);
    }

    var input = this.input = $(selector);
    input.prop('autocomplete', false);

    if (input.prop('defaultValue').length) {
        input.addClass('sayt-has-value');
    }

    if (this.input.length == 0) {
        return;
    }

    var self = this;
    this.selectAction = selectAction;
    this.results = [];
    this.limit = 5;
    this.selected = null;
    this.last = '';
    this._xhr = null;
    this.lastValue = input.prop('defaultValue');
    var prevent_clear = false; // Prevent clear on blur when clicking on SAYT

    var sayt = this.sayt = $('<div class="sayt-cont"></div>')
    .appendTo(document.body)
    .prop("id", this.options.id)
    .css({
        "position" : "absolute",
        "display" : "none"
    });


    /* Set the position of the results dialog to below the input
    */
    this.setPosition();
    $(window).on('resize', function()
    {
        self.setPosition();
    });

    input.on('focus', function(evt)
    {
        if (!input.hasClass('sayt-has-value')) {
            self.request();
        }
    })
    .on('keydown', function(evt)
    {
        // If only one result, select it with a tab
        if (
            evt.keyCode == 9 // Tab was pressed
            && input.hasClass('sayt-has-value') == false 
            && self.results.length == 1
        ) {
            self.onselect(self.sayt.find('li')[0]);
        }
    })
    .on('keydown', function(evt)
    {
        var code = evt.keyCode;

        var enter = code == 13;
        var down = code == 40;
        var up = code == 38;

        if (!enter && !down && !up) {
            return;
        }

        var selected = $('.sayt-selected', sayt);
        if (enter) {
            if (selected.length) {
                self.onselect(selected);
                sayt_clear();
            } else {
                return;
            }
        }

        evt.preventDefault();
        evt.stopPropagation();

        if ($('li', sayt).length == 0) {
            return;
        }

        if (selected.length == 0) {
            self.selected = up ? $('li', sayt).last() : $('li', sayt).first();
        } else if (down) {
            self.selected = selected.next().length ? selected.next() : selected.first(); 
        } else if (up) {
            self.selected = selected.prev().length ? selected.prev() : selected.last(); 
        }

        self.sayt.find('.sayt-selected').removeClass('sayt-selected');
        $(self.selected).addClass('sayt-selected');

        var height = parseInt(sayt.css('max-height') || parseInt(sayt.css('height')));

        if (self.selected.prop('offsetTop') < sayt.prop('scrollTop')) {
            sayt.prop('scrollTop', self.selected.prop('offsetTop'));
        } else if((self.selected.prop('offsetTop') + self.selected.prop('offsetHeight')) > sayt.prop('scrollTop') + height) {
            sayt.prop('scrollTop',  self.selected.prop('offsetTop') + self.selected.prop('offsetHeight') - height);
        }
    })
    .on('keyup', function(evt)
    {
        var code = evt.keyCode;
        
        if (this.value == self.lastValue) {
            return;        
        }

        self.lastValue = this.value;
    
        self.request();
/*
        if (
            code == 27 
            || code == 16 
            || code == 17 
            || code == 18 
            || code == 20
            || code == 9 // tab
            || code == 38 // up
            || code == 40 // down
            || code == 13 // enter
        ) {
            return;
        }



        if (this.value.length || self.select == true) {
            self.request();
        } else {
            sayt_clear();
        }
*/
    })
    .on('blur', function(evt)
    {
        var list = self.sayt.find('li');
        
        // Selection matches only choice
        if (this.value && list.length && list.length == 1) {
            var result = list.data('result');
            if (result.title.toLowerCase() == this.value.toLowerCase()) {
                self.onselect(list[0]);
            }
        } 

        if (prevent_clear == false) {
            sayt_clear();
        }
        prevent_clear = false;
    });

    var sayt_clear = function()
    {
        sayt.stop(true, true).fadeOut();
    }

    sayt.on('mousedown', function()
    {
        prevent_clear = true;
    });
/*
    .on('mouseleave', function(evt)
    {
        if (prevent_clear == true) {
            prevent_clear = false;
            sayt_clear();
        }
    });
*/

    this.sayt.on('click', 'LI', function (evt)
    {
        if (evt.button == 0) {
            self.onselect(this);
        }
    })
    .on('mouseup', function(evt)
    {
        if (evt.button == 0) {
            self.results = [];
            sayt_clear();
        }
    });
}

/* Set the position of the SAYT results relative to the field
*/
SAYT.prototype.setPosition = function(all_records)
{
    var pos = this.input.offset();
    
    this.sayt.css({
        "top" : pos.top + this.input.outerHeight(),
        "left" : pos.left
    });
}

/* Process what happens when an item form the list is selected
*/
SAYT.prototype.onselect = function(li)
{
    var result = $(li).data('result');

    if (this.selectAction) {
        if (!this.selectAction.call(this, li, result)) {
            return;
        }
    }

    this.input.val(result.title);
    this.lastValue = result.title;
    this.input.addClass('sayt-has-value');
}

/* Fetch results from the server
*/
SAYT.prototype.request = function()
{
    var self = this;

    if (this.last == this.input.val()) {
        if (self.sayt.children(".sayt-results").length) {
            self.sayt.stop(true, true).fadeIn();
        }
        return;
    }
        
    this.last = this.input.val();

    if (this._xhr) {
        this._xhr.abort();
    }
        
    var post = this.options.data || {};
    post[this.options.fieldName] = this.input.val();

    this._xhr = $.post(this.options.url, post)
    .success(function(data)
    {

        if (!data.status == 'success') {
            return;
        }
            
        var sayt = self.sayt;
        var input = self.input;
        
     	self.results = data.results;
            
        self.seletec = null;
        self.sayt.children().remove();
      //  self.sayt.fadeIn();
            
        if (self.results.length == 0) {
            self.sayt.append("<div class=\"sayt-no-results\">No Results</div>");
            self._timeout = setTimeout(function()
            {
                self._timeout = null;
                self.sayt.stop(true, true).fadeOut();
            
            }, 1000);
        } else {
            if (self._timeout) {
                clearTimeout(self._timeout);
            }

            self.sayt.stop(true, true).fadeIn();
            self.input.removeClass('sayt-has-value');
                
            self.sayt.append("<div class=\"sayt-results\"><ul></ul></div>");
            var ul = $("ul", sayt);
                
            for (var i = 0, result; result = self.results[i]; i++) {
                ul.append("<li>" + result.title +  "</li>");
                ul.children().last().data('result', result);
            }
        }
    });
}

