JobEntrySpecial = Ext.extend(Ext.Window, {
	title: '作业定时调度',
	width: 400,
	height: 270,
	closeAction: 'close',
	modal: true,
	layout: 'fit',
	initComponent: function() {
		var me = this,
		graph = getActiveGraph().getGraph(), 
		cell = graph.getSelectionCell();
		
		var wRepeat = new Ext.form.Checkbox({fieldLabel: '重复', checked: cell.getAttribute('repeat') == 'Y'}) ;
	 
		var wIntervalMinutes = new Ext.form.TextField({fieldLabel: '以分钟计算的间隔',flex:1 , value: cell.getAttribute('intervalMinutes')});
		var wIntervalSeconds = new Ext.form.TextField({  fieldLabel: '以秒计算的间隔',flex:1 , value: cell.getAttribute('intervalSeconds')});
		var wHour =new Ext.form.TextField( {
				xtype: 'textfield',
				flex: 1,
				name: 'hour',
				value: cell.getAttribute('hour')
			});
		var wMinutes=new Ext.form.TextField( {
				xtype: 'textfield',
				flex: 1,
				name: 'minutes',
				value: cell.getAttribute('minutes')
			});
		 
		var wWeekDay=new Ext.form.TextField({
			fieldLabel: '每周',
			anchor: '-10',
			name: 'weekDay',
			value: cell.getAttribute('weekDay')
		}	);
		var wDayOfMonth=new Ext.form.TextField({
			fieldLabel: '每周',
			anchor: '-10',
			name: 'dayOfMonth',
			value: cell.getAttribute('dayOfMonth')
		}	);
		
		var wSchedulerType = new Ext.form.ComboBox({
			fieldLabel: '类型',
			anchor: '-10',
			displayField: 'text',
			valueField: 'value',
			typeAhead: true,
	        mode: 'local',
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: new Ext.data.JsonStore({
	        	fields: ['value', 'text'],
	        	data: [{value: '0', text: '不需要定时'},
	        	       {value: '1', text: '时间间隔'},
	        	       {value: '2', text: '天'},
	        	       {value: '3', text: '周'},
	        	       {value: '4', text: '月'}]
		    }),
		    hiddenName: 'schedulerType',
			value: cell.getAttribute('schedulerType') 
		});
		
		var form = new Ext.form.FormPanel({
			bodyStyle: 'padding: 15px',
			defaultType: 'textfield',
			labelWidth: 100,
			labelAlign: 'right',
			items: [wRepeat , wSchedulerType , wIntervalSeconds , wIntervalMinutes,{
				fieldLabel: '每天',
				xtype: 'compositefield',
				anchor: '-10',
				items: [wHour,wMinutes]
			},wWeekDay ,wDayOfMonth]
		});
		
		this.items = form;
		
		var bCancel = new Ext.Button({
			text: '取消', handler: function() {
				me.close();
			}
		});
		var bOk = new Ext.Button({
			text: '确定', scope: this,handler: function() {
                try
                {
    				graph.getModel().beginUpdate();
    				var data= {repeat : wRepeat.getValue()?'Y':'N',
    						intervalMinutes:wIntervalMinutes.getValue(),
    						intervalSeconds:wIntervalSeconds.getValue(),
    						hour:wHour.getValue(),
    						minutes:wMinutes.getValue(),
    						weekDay:wWeekDay.getValue(),
    						dayOfMonth:wDayOfMonth.getValue(),
    						schedulerType:wSchedulerType.getValue()
    						};
                    try
                    {
        	        	for(var name in data) 
        	        	{
        					var edit = new mxCellAttributeChange(cell, name, data[name]);
        	            	graph.getModel().execute(edit);
        				}
            	        this.fireEvent('save', this, data);
                    }
                    finally{
                        graph.getModel().endUpdate();
                    }
    				me.close();
                }
                finally
                {
                    graph.getModel().endUpdate();
                }
                
				me.close();
			}
		});
		
		this.bbar = ['->', bCancel, bOk];
		
		JobEntrySpecial.superclass.initComponent.call(this);
	}
});

Ext.reg('SPECIAL', JobEntrySpecial);
