ListBox = Ext.extend(Ext.BoxComponent, {
	autoEl: {
		tag: 'select',
		multiple: 'multiple',
        size: 10
	},
	
	valueField: 'value',
	displayField: 'text',
	
	initComponent: function() {
		ListBox.superclass.initComponent.call(this);
		this.addEvents('valueChange');
	},
	afterRender: function() {
		var me = this;
		ListBox.superclass.afterRender.call(this);
		
		this.store.on('datachanged', function(s) {
			me.initStore();
		});
		
		if(this.store.getCount() > 0)
			this.initStore();
		
		this.el.on('change', function() {
			var dom = this.dom, v = dom.value, c=0;
			
			for (var i=0;i<dom.length;i++)
				if (dom.options[i].selected) c++;
			
			if(c > 1) {
				setTimeout(function() {
					dom.value = me.value;
				}, 5);
			} else {
				me.value = v;
				
				me.fireEvent('valueChange', v);
			}
		});
	},
	
	initStore: function() {
		var el = this.el, me = this;
		if(!el.dom) return;
		
		this.el.select('option').each(function(item) {
			item.remove();
		});
		
//		var tpl = new Ext.XTemplate('<tpl for="."><option value="{value}">{text}</option></tpl>'), data = [];
		this.store.each(function(rec) {
//			data.push({value: rec.get(me.valueField), text: rec.get(me.displayField)});
			
			var op = document.createElement('option');
			op.setAttribute('value', rec.get(me.valueField));
			op.appendChild(document.createTextNode(rec.get(me.displayField)));
			
			el.dom.appendChild(op);
		});	
//		tpl.overwrite(el, data);
		
		var v = Ext.isEmpty(this.value) ? this.initialConfig.value : this.value;
		
		if(!Ext.isEmpty(v))
			this.setValue(v);
	},
	
	getValue: function() {
		return this.value;
	},
	
	getStore: function() {
		return this.store;
	},
	
	setValue: function(v, flag) {
		this.value = v;
		var count = this.el.select('option').getCount();
		for(var i=0; i<count; i++) {
			var item = this.el.select('option').item(i);
			if(item.getValue() == v) {
				item.dom.setAttribute('selected', 'selected');
			} else {
				item.dom.removeAttribute('selected');
			}
		}
		
		this.fireEvent('valueChange', v);
	}
});


ListView = Ext.extend(Ext.list.ListView, {
	
	hideHeaders: true,
	reserveScrollOffset: true,
	multiSelect: false,
	singleSelect: true,
	valueField: 'value',
	
	initComponent: function() {
		ListView.superclass.initComponent.call(this);
	},
	
	getValue: function() {
		var data = [];
		Ext.each(this.getSelectedRecords(), function(rec) {
			data.push(rec.get(this.valueField));
		}, this);
		
		if(data.length == 1 && this.singleSelect === true)
			data = data[0];
		return data;
	},
	
	setValue: function(values) {
		if(!this.getStore())
			return;
		Ext.each(values, function(v) {
			var index = this.getStore().find(this.valueField, v);
			if(index >= 0) 
				this.selectRange(index, index, true);
		}, this);
	}
	
});