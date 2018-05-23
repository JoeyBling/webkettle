Ext.DatetimePicker = Ext.extend(Ext.DatePicker, {
	
	sureText : '确定',
	
	initComponent: function() {
		Ext.DatetimePicker.superclass.initComponent.call(this);
	},
	
    sureClick : function(e, t){
    	if(!this.hourField.isValid())
    		return;
    	if(!this.minuteField.isValid())
    		return;
    	if(!this.secondField.isValid())
    		return;
    	
    	var h = this.hourField.getValue();
    	h = h == '' ? 0 : parseInt(h);
    	
    	var m = this.minuteField.getValue();
    	m = m == '' ? 0 : parseInt(m);
    	
    	var s = this.secondField.getValue();
    	s = s == '' ? 0 : parseInt(s);
    	
    	e.stopEvent();
        if(!this.disabled && t.dateValue && !Ext.fly(t.parentNode).hasClass('x-date-disabled')){
            this.cancelFocus = this.focusOnSelect === false;
            var date = new Date(t.dateValue);
            date.setHours(h);
        	date.setMinutes(m);
        	date.setSeconds(s);
            
            this.setValue(date);
            delete this.cancelFocus;
            this.fireEvent('select', this, date);
        }
    },
    
    selectDate: function(e, t){
        e.stopEvent();
        if(!this.disabled && t.dateValue && !Ext.fly(t.parentNode).hasClass("x-date-disabled")){
        	var date = new Date(t.dateValue);
            this.setValue(date);
        }
    },
    
 	onRender: function(container, position) {
    	var m = ['<table cellspacing="0">',
                    '<tr><td class="x-date-left"><a href="#" title="', this.prevText ,'">&#160;</a></td><td class="x-date-middle" align="center"></td><td class="x-date-right"><a href="#" title="', this.nextText ,'">&#160;</a></td></tr>',
                    '<tr><td colspan="3"><table class="x-date-inner" cellspacing="0"><thead><tr>'];
        var dn = this.dayNames, i;
        for(i = 0; i < 7; i++){
            var d = this.startDay+i;
            if(d > 6){
                d = d-7;
            }
            m.push('<th><span>', dn[d].substr(0,1), '</span></th>');
        }
        m[m.length] = '</tr></thead><tbody><tr>';
        for(i = 0; i < 42; i++) {
            if(i % 7 === 0 && i !== 0){
                m[m.length] = '</tr><tr>';
            }
            m[m.length] = '<td><a href="#" hidefocus="on" class="x-date-date" tabIndex="1"><em><span></span></em></a></td>';
        }
        m.push('</tr></tbody></table></td></tr>',
        	   '<tr><td colspan="3" class="x-datetime-bottom" align="center">',
        	   '<table cellspacing="0" width="100%"><tr>',
        	   '<td class="y-hour-middle" align="center"></td><td width="23" align="center" class="datetime-yms">时</td>',
        	   '<td class="y-minute-middle" align="center"></td><td width="23" align="center" class="datetime-yms">分</td>',
        	   '<td class="y-second-middle" align="center"></td><td width="23" align="center" class="datetime-yms">秒</td>',
        	   '<td class="x-datetime-button" align="center"></td>',
        	   '</tr></table>',
               '</td></tr></table><div class="x-date-mp"></div><div class="x-hour-mp"></div><div class="x-minute-mp"></div><div class="x-second-mp"></div>');
    	
        var el = document.createElement("div");
        el.className = "x-date-picker";
        el.innerHTML = m.join("");
        container.dom.insertBefore(el, position);

        this.el = Ext.get(el);
        this.eventEl = Ext.get(el.firstChild);
        this.eventEl.on("mousewheel", this.handleMouseWheel,  this);
        this.eventEl.on("click", this.selectDate,  this, {delegate: "a.x-date-date"});
        
        this.prevRepeater = new Ext.util.ClickRepeater(this.el.child('td.x-date-left a'), {
            handler: this.showPrevMonth,
            scope: this,
            preventDefault:true,
            stopDefault:true
        });

        this.nextRepeater = new Ext.util.ClickRepeater(this.el.child('td.x-date-right a'), {
            handler: this.showNextMonth,
            scope: this,
            preventDefault:true,
            stopDefault:true
        });

        this.monthPicker = this.el.down('div.x-date-mp');
        this.monthPicker.enableDisplayMode('block');
        
        var kn = new Ext.KeyNav(this.eventEl, {
            "left" : function(e){
                e.ctrlKey ?
                    this.showPrevMonth() :
                    this.update(this.activeDate.add("d", -1));
            },

            "right" : function(e){
                e.ctrlKey ?
                    this.showNextMonth() :
                    this.update(this.activeDate.add("d", 1));
            },

            "up" : function(e){
                e.ctrlKey ?
                    this.showNextYear() :
                    this.update(this.activeDate.add("d", -7));
            },

            "down" : function(e){
                e.ctrlKey ?
                    this.showPrevYear() :
                    this.update(this.activeDate.add("d", 7));
            },

            "pageUp" : function(e){
                this.showNextMonth();
            },

            "pageDown" : function(e){
                this.showPrevMonth();
            },

            "enter" : function(e){
                e.stopPropagation();
                return true;
            },

            scope : this
        });

        this.el.unselectable();
        
        this.cells = this.el.select("table.x-date-inner tbody td");
        this.textNodes = this.el.query("table.x-date-inner tbody span");

        this.mbtn = new Ext.Button({
            text: "&#160;",
            tooltip: this.monthYearText,
            renderTo: this.el.child("td.x-date-middle", true)
        });

        this.mbtn.on('click', this.showMonthPicker, this);
        this.mbtn.el.child(this.mbtn.menuClassTarget).addClass("x-btn-with-menu");

        var dt1 = this.value || new Date();
        var today = (new Date()).dateFormat(this.format);
        var sureBtn = new Ext.Button({
            renderTo: this.el.child("td.x-datetime-button", true),
            text: this.sureText,
            handler: function(btn, e) {
        		var selected = Ext.DomQuery.selectNode('td.x-date-selected');
        		if(!selected)
        			selected = Ext.DomQuery.selectNode('td.x-date-today');
        		
        		this.sureClick(e, selected.firstChild);
        	},
            scope: this
        });
        
        var hourField = this.hourField = new Ext.form.SpinnerField({
            renderTo: this.el.child("td.y-hour-middle", true),
            width: 40,
            minValue: 0,
            maxValue: 23,
            enableKeyEvents: true,
            value: dt1.getHours()
        });
        hourField.getEl().setTop(0);
        
        var hourmp = this.el.down('div.x-hour-mp');
        var hourSelector = new Ext.Container({
        	cls: 'x-hms-bg',
        	renderTo: hourmp,
        	style: 'background-color: #555555',
        	layout: 'table',
        	layoutConfig: {columns:6}
        });
        for(var i=0; i<24; i++) {
        	var comp = new Ext.Component({
        		overCls: 'x-hour-active',
        		html: '' + i
        	});
        	hourSelector.add(comp);
        }
        hourSelector.doLayout();
    	hourmp.on('click', function(e, t) {
        	var num = parseInt(t.innerText || t.innerHTML);
        	hourField.setValue(num);
        });
        
        hourField.on({
        	focus: function() {
        		hourmp.show();
        		hourmp.alignTo(hourField.getEl(), 'bl-bl', [0, -28]);
            },
            blur: function() {
            	hourmp.hide.defer(150, hourmp);
            }
        });
        
        var minuteField = this.minuteField = new Ext.form.SpinnerField({
            renderTo: this.el.child("td.y-minute-middle", true),
            width: 40,
            minValue: 0,
            maxValue: 59,
            value: dt1.getMinutes()
        });
        minuteField.getEl().setTop(0);
        
        var minutemp = this.el.down('div.x-minute-mp');
        var minuteSelector = new Ext.Container({
        	cls: 'x-hms-bg',
        	renderTo: minutemp,
        	style: 'background-color: #555555',
        	layout: 'table',
        	layoutConfig: {columns: 4}
        });
        for(var i=0; i<60; i+=5) {
        	var comp = new Ext.Component({
        		overCls: 'x-hour-active',
        		html: '' + i
        	});
        	minuteSelector.add(comp);
        }
        minuteSelector.doLayout();
    	minutemp.on('click', function(e, t) {
        	var num = parseInt(t.innerText || t.innerHTML);
        	minuteField.setValue(num);
        });
        
    	minuteField.on({
        	focus: function() {
        		minutemp.show();
        		minutemp.alignTo(hourField.getEl(), 'bl-bl', [65, -28]);
            },
            blur: function() {
            	minutemp.hide.defer(150, minutemp);
            }
        });
        
        var secondField = this.secondField = new Ext.form.SpinnerField({
            renderTo: this.el.child("td.y-second-middle", true),
            width: 40,
            minValue: 0,
            maxValue: 59,
            value: 0
        });
        secondField.getEl().setTop(0);
        
        var secondmp = this.el.down('div.x-second-mp');
        var secondSelector = new Ext.Container({
        	cls: 'x-hms-bg',
        	renderTo: secondmp,
        	style: 'background-color: #555555',
        	layout: 'table',
        	layoutConfig: {columns: 4}
        });
        for(var i=0; i<60; i+=5) {
        	var comp = new Ext.Component({
        		overCls: 'x-hour-active',
        		html: '' + i
        	});
        	secondSelector.add(comp);
        }
        secondSelector.doLayout();
    	secondmp.on('click', function(e, t) {
        	var num = parseInt(t.innerText || t.innerHTML);
        	secondField.setValue(num);
        });
        
    	secondField.on({
        	focus: function() {
        		secondmp.show();
        		secondmp.alignTo(hourField.getEl(), 'bl-bl', [125, -28]);
            },
            blur: function() {
            	secondmp.hide.defer(150, secondmp);
            }
        });

        if(Ext.isIE){
            this.el.repaint();
        }
        this.update(this.value);
	},
	update : function(date){
		if(this.rendered){
	        var vd = this.activeDate;
	        this.activeDate = date;
	        if(vd && this.el){
	            var t = date.getTime();
	            if(vd.getMonth() == date.getMonth() && vd.getFullYear() == date.getFullYear()){
	                this.cells.removeClass("x-date-selected");
	                this.cells.each(function(c){
	                   if(c.dom.firstChild.dateValue == t){
	                       c.addClass("x-date-selected");
	                       return false;
	                   }
	                });
	                return;
	            }
	        }
	        var days = date.getDaysInMonth();
	        var firstOfMonth = date.getFirstDateOfMonth();
	        var startingPos = firstOfMonth.getDay()-this.startDay;
	
	        if(startingPos <= this.startDay){
	            startingPos += 7;
	        }
	
	        var pm = date.add("mo", -1);
	        var prevStart = pm.getDaysInMonth()-startingPos;
	
	        var cells = this.cells.elements;
	        var textEls = this.textNodes;
	        days += startingPos;
	
	        // convert everything to numbers so it's fast
	        var day = 86400000;
	        var d = (new Date(pm.getFullYear(), pm.getMonth(), prevStart)).clearTime();
	        var today = new Date().clearTime().getTime();
	        var sel = date.getTime();
	        var min = this.minDate ? this.minDate.clearTime() : Number.NEGATIVE_INFINITY;
	        var max = this.maxDate ? this.maxDate.clearTime() : Number.POSITIVE_INFINITY;
	        var ddMatch = this.disabledDatesRE;
	        var ddText = this.disabledDatesText;
	        var ddays = this.disabledDays ? this.disabledDays.join("") : false;
	        var ddaysText = this.disabledDaysText;
	        var format = this.format;
	
	        var setCellClass = function(cal, cell){
	            cell.title = "";
	            var t = d.getTime();
	            cell.firstChild.dateValue = t;
	            if(t == today){
	                cell.className += " x-date-today";
	                cell.title = cal.todayText;
	            }
	            if(t == sel){
	                cell.className += " x-date-selected";
	                setTimeout(function(){
	                    try{cell.firstChild.focus();}catch(e){}
	                }, 50);
	            }
	            // disabling
	            if(t < min) {
	                cell.className = " x-date-disabled";
	                cell.title = cal.minText;
	                return;
	            }
	            if(t > max) {
	                cell.className = " x-date-disabled";
	                cell.title = cal.maxText;
	                return;
	            }
	            if(ddays){
	                if(ddays.indexOf(d.getDay()) != -1){
	                    cell.title = ddaysText;
	                    cell.className = " x-date-disabled";
	                }
	            }
	            if(ddMatch && format){
	                var fvalue = d.dateFormat(format);
	                if(ddMatch.test(fvalue)){
	                    cell.title = ddText.replace("%0", fvalue);
	                    cell.className = " x-date-disabled";
	                }
	            }
	        };
	
	        var i = 0;
	        for(; i < startingPos; i++) {
	            textEls[i].innerHTML = (++prevStart);
	            d.setDate(d.getDate()+1);
	            cells[i].className = "x-date-prevday";
	            setCellClass(this, cells[i]);
	        }
	        for(; i < days; i++){
	            intDay = i - startingPos + 1;
	            textEls[i].innerHTML = (intDay);
	            d.setDate(d.getDate()+1);
	            cells[i].className = "x-date-active";
	            setCellClass(this, cells[i]);
	        }
	        var extraDays = 0;
	        for(; i < 42; i++) {
	             textEls[i].innerHTML = (++extraDays);
	             d.setDate(d.getDate()+1);
	             cells[i].className = "x-date-nextday";
	             setCellClass(this, cells[i]);
	        }
	
	        this.mbtn.setText(this.monthNames[date.getMonth()] + " " + date.getFullYear());
	
	        this.updateTime();
	
	        if(!this.internalRender){
	            var main = this.el.dom.firstChild;
	            var w = main.offsetWidth;
	            this.el.setWidth(w + this.el.getBorderWidth("lr"));
	            Ext.fly(main).setWidth(w);
	            this.internalRender = true;
	            if(Ext.isOpera && !this.secondPass){
	                main.rows[0].cells[1].style.width = (w - (main.rows[0].cells[0].offsetWidth+main.rows[0].cells[2].offsetWidth)) + "px";
	                this.secondPass = true;
	                this.update.defer(10, this, [date]);
	            }
	        }
		}
	},
	updateTime: function() {
		this.hourField.setValue(this.value.getHours());
		this.minuteField.setValue(this.value.getMinutes());
		this.secondField.setValue(this.value.getSeconds());
	},
	setValue: function(v) {
		this.value = v;
		this.update(this.value);
	},
	getValue: function(v) {
		var h = parseInt(this.theHours+'');
		var m = parseInt(this.theMinutes+'');
		var s = parseInt(this.theSeconds+'');
		this.value.setHours(h);
		this.value.setMinutes(m);
		this.value.setSeconds(s);
		
		return this.value;
	}
});

DatetimeMenu = Ext.extend(Ext.menu.Menu, {
    enableScrolling : false,
    hideOnClick : true,
    pickerId : null,
    cls : 'x-date-menu',
    initComponent : function(){
        this.on('beforeshow', this.onBeforeShow, this);
        if(this.strict = (Ext.isIE7 && Ext.isStrict)){
            this.on('show', this.onShow, this, {single: true, delay: 20});
        }
        Ext.apply(this, {
            plain: true,
            showSeparator: false,
            items: this.picker = new Ext.DatetimePicker(Ext.applyIf({
                internalRender: this.strict || !Ext.isIE,
                ctCls: 'x-menu-date-item',
                id: this.pickerId
            }, this.initialConfig))
        });
        this.picker.purgeListeners();
        DatetimeMenu.superclass.initComponent.call(this);
        this.relayEvents(this.picker, ['select']);
        this.on('show', this.picker.focus, this.picker);
        this.on('select', this.menuHide, this);
        if(this.handler){
            this.on('select', this.handler, this.scope || this);
        }
    },

    menuHide : function() {
        if(this.hideOnClick){
            this.hide(true);
        }
    },

    onBeforeShow : function(){
        if(this.picker){
            this.picker.hideMonthPicker(true);
        }
    },

    onShow : function(){
        var el = this.picker.getEl();
        el.setWidth(el.getWidth());
    }
});
Ext.reg('datetimemenu', DatetimeMenu);

DatetimeField = Ext.extend(Ext.form.DateField, {
	
	validateOnBlur: false,
	
	initComponent: function() {
		DatetimeField.superclass.initComponent.call(this);
	},
	
	afterRender: function() {
		DatetimeField.superclass.afterRender.call(this);
		this.getEl().on('click', function() {
			this.onTriggerClick();
		}, this);
	},
	
	safeParse : function(value, format) {
        if (/[gGhH]/.test(format.replace(/(\\.)/g, ''))) {
            return Date.parseDate(value, format);
        } else {
        	return Date.parseDate(value + ' ' + this.initTime, format + ' ' + this.initTimeFormat);
        }
    },
	onTriggerClick : function(){
        if(this.disabled) return;
        if(this.menu == null){
        	var me = this;
            this.menu = new DatetimeMenu({
                hideOnClick: false,
                focusOnSelect: false
            });
            
            this.menu.on('hide', function() {
            	me.onBlur();
            });
        }
        this.onFocus();
        Ext.apply(this.menu.picker,  {
            minDate : this.minValue,
            maxDate : this.maxValue,
            disabledDatesRE : this.disabledDatesRE,
            disabledDatesText : this.disabledDatesText,
            disabledDays : this.disabledDays,
            disabledDaysText : this.disabledDaysText,
            format : this.format,
            showToday : this.showToday,
            startDay: this.startDay,
            minText : String.format(this.minText, this.formatDate(this.minValue)),
            maxText : String.format(this.maxText, this.formatDate(this.maxValue))
        });
        this.menu.picker.setValue(this.getValue() || new Date());
        this.menu.show(this.el, "tl-bl?");
        this.menuEvents('on');
    }
});

Ext.reg('datetime', DatetimeField);