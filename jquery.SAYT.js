/*------------------------------------*\
    Search as You Type
\*------------------------------------*/
/*
*   A click event can be attached to this object using jQuery to handle what happens when clicked
*/
function SAYT(selector, options)
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

    if (this.input.length == 0) {
        return;
    }

    var sayt = this.sayt = $('<div class="sayt-cont"></div>')
    .appendTo(document.body)
    .prop("id", this.options.id)
    .css({
        "position" : "absolute",
        "display" : "none"
    });

    var self = this;
    this.results = [];
    this.limit = 5;
    this.select = false; // Operate as a select, or a search
    this.selected = null;
    this.last = '';
    this._xhr = null;

    /* Set the position of the results dialog to below the input
    */
    this.setPosition();
    $(window).on('resize', function()
    {
        self.setPosition();
    });

    input.on('focus', function(evt)
    {
        if (self.select == true) {
            self.request(true);
            input.removeClass('selected');
        } else {
            self.request();
        }
    })
    .on('keydown', function(evt)
    {
        if (
            self.select 
            && evt.keyCode == 9 // Tab was pressed
            && input.hasClass('selected') == false 
            && self.results.length == 1
        ) {
            var result = self.results[0];
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

        var selected = $('.selected', sayt);
        if (enter) {
            if (selected.length) {
                selected.trigger('click');        
                selected.trigger('mouseup');        
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

        selected.removeClass('selected');
        $(self.selected).addClass('selected');

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
        
        if (
            code == 27 
            || code == 16 
            || code == 17 
            || code == 18 
            || code == 20
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
    })
    .on('blur', function()
    {
        if (self.select && this.value.length && this.value == this.defaultValue) {
            input.addClass('selected');
        }
        sayt_clear();
    });

    var prevent_clear = false;
    var sayt_clear = function()
    {
        if (prevent_clear == true) {
            return;
        }

        sayt.stop();
        sayt.fadeOut();
    }

    sayt.on('mousedown', function()
    {
	console.log('foo bar');
        prevent_clear = true;
    })
    .on('mouseleave', function(evt)
    {
        if (prevent_clear == true) {
            prevent_clear = false;
            sayt_clear();
        }
    });

    this.sayt.on('click', 'LI', function (evt)
    {
        $(self).trigger('click', this);
    })
    .on('mouseup', function()
    {
        input.addClass('selected');
        self.results = [];
        prevent_clear = false;
        sayt_clear();
    });
}

SAYT.prototype.setPosition = function(all_records)
{
    var pos = this.input.offset();
    
    this.sayt.css({
        "top" : pos.top + this.input.outerHeight(),
        "left" : pos.left
    });
}

SAYT.prototype.request = function(all_records)
{
    var self = this;

    if (this.last == this.input.val()) {
        if (self.sayt.children(".sayt-results").length) {
            self.sayt.stop().fadeIn();
        }
        return;
    }
        
    this.last = this.input.val();

    if (this._xhr) {
        this._xhr.abort();
    }
        
    var post = this.options.data || {};
    post[this.options.fieldName] = all_records == true ? '' : this.input.val();

    this._xhr = $.post(this.options.url, post)
    .success(function(data)
    {

        if (!data.status == 'success') {
            return;
        }
            
        var sayt = self.sayt;
        var input = self.input;
        
        var results = data.results;
            
        self.seletec = null;
        self.sayt.children().remove();
      //  self.sayt.fadeIn();
            
        if (results.length == 0) {
            self.sayt.append("<div class=\"sayt-no-results\">No Results</div>");
            self._timeout = setTimeout(function()
            {
                self._timeout = null;
                self.sayt.stop().fadeOut();
            
            }, 1000);
        } else {
            if (self._timeout) {
                clearTimeout(self._timeout);
            }

            self.sayt.stop().fadeIn();
            self.input.removeClass('selected');
                
            self.sayt.append("<div class=\"sayt-results\"><ul></ul></div>");
            var ul = $("ul", sayt);
                
            for (var i = 0, result; result = results[i]; i++) {
                ul.append("<li>" + result.title +  "</li>");
                ul.children().last().data('result', result);
            }
        }
    });
}

