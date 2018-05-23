Scheduler2Dialog = Ext.extend(Ext.Window, {
	title: '添加调度',
	width: 600,
	height: 400,
	layout: 'card',
	activeItem: 0,
	defaults: {border: false},
	modal: true,
	
	initComponent: function() {
		var wName = new Ext.form.TextField({fieldLabel: '名称', anchor: '-10', readOnly: true});
		var wGroup = new Ext.form.ComboBox({
			fieldLabel: '所属组', 
			displayField: 'group',
			valueField: 'group',
			anchor: '-10',
			typeAhead: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: new Ext.data.JsonStore({
				fields: ['group'],
				url: GetUrl('schedule/groups.do')
			})
		});
			
		var wDescription = new Ext.form.TextArea({fieldLabel: '描述', anchor: '-10', height: 200});
		
		var wStartTime = new DatetimeField({fieldLabel: '开始时间', format: 'Y/m/d H:i:s.u', anchor: '-10'});
		var wEndTime = new DatetimeField({fieldLabel: '结束时间', format: 'Y/m/d H:i:s.u', anchor: '-10'});
		var wRepeat = new Ext.form.TextField({fieldLabel: '循环次数', anchor: '-10'});
		var wInterval = new Ext.form.TextField({fieldLabel: '循环频率', anchor: '-10'});
		
		var wCron = new Ext.form.TextField({flex: 1});
		var wViewPlan = new Ext.Button({text: '查看执行计划'});
		
		var fs1 = new Ext.form.FieldSet({
			title: '简单触发器',
            autoHeight:true,
            items :[wStartTime, wEndTime, wRepeat, wInterval]
		});
		
		var fs2  = new Ext.form.FieldSet({
			title: '高级触发器',
            autoHeight:true,
            disabled: true,
            items :[{
            	xtype: 'compositefield',
            	fieldLabel: '表达式',
            	anchor: '-10',
            	items: [wCron, wViewPlan]
            }]
		});
		
		var fs1_cb = new Ext.form.Checkbox({boxLabel: '启用简单触发器', checked: true});
		var fs2_cb = new Ext.form.Checkbox({boxLabel: '启用高级触发器'});
		
		fs1_cb.on('check', function(cb, checked) {
			if(checked === true) {
				fs1.enable();
				fs2.disable();
				
				fs2_cb.setValue(false);
			}
		});
		
		fs2_cb.on('check', function(cb, checked) {
			if(checked === true) {
				fs2.enable();
				fs1.disable();
				
				fs1_cb.setValue(false);
			}
		});
		
		var p2 = new Ext.Panel({
			bodyStyle: 'padding: 0px 10px',
			defaults: {border: false},
			items: [{
				xtype: 'KettleForm',
				labelWidth: 1,
				height: 30,
				items: fs1_cb
			}, {
				xtype: 'KettleForm',
				labelWidth: 70,
				items: [fs1]
			}, {
				xtype: 'KettleForm',
				labelWidth: 1,
				height: 30,
				items: fs2_cb
			}, {
				xtype: 'KettleForm',
				labelWidth: 70,
				items: [fs2]
			}]
		});
		
		this.items = [p2];
		
		this.initData = function(jobName) {
			Ext.Ajax.request({
				url: GetUrl('schedule/load.do'),
				method: 'POST',
				params: {name: jobName},
				success: function(response) {
					var doc = response.responseXML;
					var data = doc.documentElement;
					
					if('simple' == data.getAttribute('triggerType')) {
						fs1_cb.setValue(true);
						
						wStartTime.setValue(data.getAttribute('startTime'));
						wEndTime.setValue(data.getAttribute('endTime'));
						wRepeat.setValue(data.getAttribute('repeat'));
						wInterval.setValue(data.getAttribute('interval'));
					} else if('cron' == data.getAttribute('triggerType')) {
						fs2_cb.setValue(true);
						wCron.setValue(data.getAttribute('cron'));
					}
				},
				failure: failureResponse
		   });
		};
		
		this.cardIndex = 0;
		this.bbar = ['->', {
			text: '取消', scope: this, handler: function() {
				this.close();
			}
		}, {
			text: '配置执行方式', scope: this, handler: function() {
				alert('采用默认执行方式，待开发！');
			}
		}, {
			text: '确定', scope: this, handler: function() {
				var doc = mxUtils.createXmlDocument();
				var data = doc.createElement('scheduler');
				
				if(fs1_cb.getValue() === true) {
					data.setAttribute('triggerType', 'simple');
					
					var dd = wStartTime.getValue();
					if(Ext.isDate(dd))
						dd = dd.format(wStartTime.format);
					data.setAttribute('startTime', dd);
					
					dd = wEndTime.getValue();
					if(Ext.isDate(dd))
						dd = dd.format(wEndTime.format);
					data.setAttribute('endTime', dd);
					
					data.setAttribute('repeat', wRepeat.getValue());
					data.setAttribute('interval', wInterval.getValue());
				} else if(fs2_cb.getValue() == true) {
					data.setAttribute('triggerType', 'cron');
					data.setAttribute('cron', wCron.getValue());
				}
				
				if(this.fireEvent('ok', data) !== false) {
					this.close();
				}
			}
		}];
		
		Scheduler2Dialog.superclass.initComponent.call(this);
		this.addEvents('ok')
	}

});


SchedulerDialog = Ext.extend(Ext.Window, {
	title: '添加调度',
	width: 600,
	height: 400,
	layout: 'card',
	activeItem: 0,
	defaults: {border: false},
	modal: true,
	
	initComponent: function() {
		var wName = new Ext.form.TextField({fieldLabel: '名称', anchor: '-10', readOnly: true});
		var wGroup = new Ext.form.ComboBox({
			fieldLabel: '所属组', 
			displayField: 'group',
			valueField: 'group',
			anchor: '-10',
			typeAhead: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: new Ext.data.JsonStore({
				fields: ['group'],
				url: GetUrl('schedule/groups.do')
			})
		});
			
		var wDescription = new Ext.form.TextArea({fieldLabel: '描述', anchor: '-10', height: 200});
		
		var wStartTime = new DatetimeField({fieldLabel: '开始时间', format: 'Y/m/d H:i:s.u', anchor: '-10'});
		var wEndTime = new DatetimeField({fieldLabel: '结束时间', format: 'Y/m/d H:i:s.u', anchor: '-10'});
		var wRepeat = new Ext.form.TextField({fieldLabel: '循环次数', anchor: '-10'});
		var wInterval = new Ext.form.TextField({fieldLabel: '循环频率', anchor: '-10'});
		
		var wCron = new Ext.form.TextField({fieldLabel: '表达式', anchor: '-10'});
		var wViewPlan = new Ext.Button({text: '查看执行计划'});
		
		var p1 = new KettleForm({
			labelWidth: 55,
			items: [wName, wGroup, wDescription]
		});
		
		var fs1 = new Ext.form.FieldSet({
			title: '简单触发器',
            autoHeight:true,
            items :[wStartTime, wEndTime, wRepeat, wInterval]
		});
		
		var fs2  = new Ext.form.FieldSet({
			title: '高级触发器',
            autoHeight:true,
            disabled: true,
            items :[wCron, wViewPlan]
		});
		
		var fs1_cb = new Ext.form.Checkbox({boxLabel: '启用简单触发器', checked: true});
		var fs2_cb = new Ext.form.Checkbox({boxLabel: '启用高级触发器'});
		
		fs1_cb.on('check', function(cb, checked) {
			if(checked === true) {
				fs1.enable();
				fs2.disable();
				
				fs2_cb.setValue(false);
			}
		});
		
		fs2_cb.on('check', function(cb, checked) {
			if(checked === true) {
				fs2.enable();
				fs1.disable();
				
				fs1_cb.setValue(false);
			}
		});
		
		var p2 = new Ext.Panel({
			bodyStyle: 'padding: 0px 10px',
			defaults: {border: false},
			items: [{
				xtype: 'KettleForm',
				labelWidth: 1,
				height: 30,
				items: fs1_cb
			}, {
				xtype: 'KettleForm',
				labelWidth: 70,
				items: [fs1]
			}, {
				xtype: 'KettleForm',
				labelWidth: 1,
				height: 30,
				items: fs2_cb
			}, {
				xtype: 'KettleForm',
				labelWidth: 70,
				items: [fs2]
			}]
		});
		
		this.items = [p1, p2];
		
		this.initData = function(repositoryId) {
			Ext.Ajax.request({
				url: GetUrl('schedule/load.do'),
				method: 'POST',
				params: {name: repositoryId},
				success: function(response) {
					var doc = response.responseXML;
					var data = doc.documentElement;
					
					wName.setValue(data.getAttribute('name'));
					wGroup.setValue(data.getAttribute('group'));
					wDescription.setValue(decodeURIComponent(data.getAttribute('description')));
					
					if('simple' == data.getAttribute('triggerType')) {
						fs1_cb.setValue(true);
						
						wStartTime.setValue(data.getAttribute('startTime'));
						wEndTime.setValue(data.getAttribute('endTime'));
						wRepeat.setValue(data.getAttribute('repeat'));
						wInterval.setValue(data.getAttribute('interval'));
					} else if('cron' == data.getAttribute('triggerType')) {
						fs2_cb.setValue(true);
						wCron.setValue(data.getAttribute('cron'));
					}
				},
				failure: failureResponse
		   });
		};
		
		this.cardIndex = 0;
		this.bbar = ['->', {
			text: '取消', scope: this, handler: function() {
				this.close();
			}
		}, {
			text: '<上一步', scope: this, handler: function() {
				if(this.cardIndex > 0) {
					this.cardIndex--;
					this.getLayout().setActiveItem(this.cardIndex);
				}
			}
		},{
			text: '下一步>', scope: this, handler: function() {
				if(this.cardIndex <2) {
					this.cardIndex++;
					this.getLayout().setActiveItem(this.cardIndex);
				}
			}
		}, {
			text: '确定', scope: this, handler: function() {
				var doc = mxUtils.createXmlDocument();
				var data = doc.createElement('scheduler');
				
				data.setAttribute('name', wName.getValue());
				data.setAttribute('group', wGroup.getValue());
				data.setAttribute('description', encodeURIComponent(wDescription.getValue()));
				
				if(fs1_cb.getValue() === true) {
					data.setAttribute('triggerType', 'simple');
					
					var dd = wStartTime.getValue();
					if(Ext.isDate(dd))
						dd = dd.format(wStartTime.format);
					data.setAttribute('startTime', dd);
					
					dd = wEndTime.getValue();
					if(Ext.isDate(dd))
						dd = dd.format(wEndTime.format);
					data.setAttribute('endTime', dd);
					
					data.setAttribute('repeat', wRepeat.getValue());
					data.setAttribute('interval', wInterval.getValue());
				} else if(fs2_cb.getValue() == true) {
					data.setAttribute('triggerType', 'cron');
					data.setAttribute('cron', wCron.getValue());
				}
				
				if(this.fireEvent('ok', data) !== false) {
					this.close();
				}
			}
		}];
		
		SchedulerDialog.superclass.initComponent.call(this);
		this.addEvents('ok')
	}

});