SimpleEvalDialog = Ext.extend(KettleTabDialog,{
	width:500,
	height:500,
	title:'检验字段的值',
	initComponent:function(){
		var me = this,  graph = getActiveGraph().getGraph(),  cell = graph.getSelectionCell();
		
		this.getValues = function(){
			return{
				valuetype:wEvaluate.getValue(),
				fieldname:wFieldName.getValue(),
				variablename:wVariablename.getValue(),
				fieldtype:wFieldtype.getValue(),
				successcondition:wSuccesscondition.getValue(),
				comparevalue:wcomparevalue.getValue(),
				successbooleancondition:wSuccessBooleancondition.getValue(),
				successnumbercondition:wSuccessNumberCondition.getValue(),
				successwhenvarset:wSuccessWhen.getValue()?"Y" : "N",
				mask:wMask.getValue(),
			};
		};
		
		var evaluateStore = new Ext.data.JsonStore({fields: ['value', 'text'],
			data:[{value:'field',text:'将上一步结果的字段'},{value:'variable',text:'变量'}]});
		var wEvaluate = new  Ext.form.ComboBox({id:'eval',fieldLabel:'检验',anchor:'',flex:1,store:evaluateStore,displayField: 'text',valueField: 'value',editable: false,mode: 'local',triggerAction: 'all',value:cell.getAttribute('valuetype'),
			listeners:{
				'select':function(value){
					if(wEvaluate.getValue()=='variable'){
						wSuccessWhen.setVisible(true);
						wFieldName.setVisible(false);
						wVariablename.setVisible(true);
					}else{
						wSuccessWhen.setVisible(false);
						wFieldName.setVisible(true);
						wVariablename.setVisible(false);
					}
				}
			}});
		var wFieldName = new Ext.form.TextField({fieldLabel:'文件名',anchor:'',flex:1,value:cell.getAttribute('fieldname')});
		var wVariablename = new Ext.form.TextField({fieldLabel:'字段名',anchor:'',flex:1,value:cell.getAttribute('variablename')});

		var typeStore = new Ext.data.JsonStore({fields:['value','text'],data:[{value:'string',text:'String'},{value:'number',text:'Number'},{value:'datetime',text:'date time'},{value:'boolean',text:'Boolean'}]});
		
		
		var wFieldtype = new Ext.form.ComboBox({fieldLabel:'类型',anchor:'',flex:1,store:typeStore,displayField:'text',valueField:'value',editable:false,mode:'local',triggerAction:'all',value:cell.getAttribute('fieldtype'),
			listeners:{
			'select':function(value){
				if(wFieldtype.getValue()=='boolean'){
					//alert('Boolean');
					wcomparevalue.setVisible(false);
				/*	//wSuccesscondition.setStore(typeStore);
					conditionStore.removeAll();
					var data = [{value:'true',text:'如果值是True'},{value:'false',text:'如果值是false'}];
					conditionStore.loadData(data,true);*/
					wSuccesscondition.setVisible(false);
					wSuccessNumberCondition.setVisible(false);
					wSuccessBooleancondition.setVisible(true);
					wMask.setVisible(false);
				}else if(wFieldtype.getValue()=='string'){
					wcomparevalue.setVisible(true);
					/*wSuccesscondition.store=Ext.StoreMgr.get('successConditionStore');*/
					wSuccesscondition.setVisible(true);
					wSuccessNumberCondition.setVisible(false);
					wSuccessBooleancondition.setVisible(false);
					wMask.setVisible(false);
				}else if(wFieldtype.getValue()=='datetime'){
					wcomparevalue.setVisible(true);
					/*conditionStore.removeAll();
					var data =wSuccesscondition.store=Ext.StoreMgr.get('successNumberConditionStore').Data;*/
					/*conditionStore.loadData(data,true);*/
					//alert(data);
					wSuccesscondition.setVisible(false);
					wSuccessNumberCondition.setVisible(true);
					wSuccessBooleancondition.setVisible(false);
					wMask.setVisible(true);
				}else if(wFieldtype.getValue()=='number'){
					wcomparevalue.setVisible(true);
					/*conditionStore.removeAll();
					var data = Ext.StoreMgr.get('successNumberConditionStore').Data;
					conditionStore.loadData(data,true);
					conditionStore = Ext.StoreMgr.get('successNumberConditionStore');*/
					wSuccesscondition.setVisible(false);
					wSuccessNumberCondition.setVisible(true);
					wSuccessBooleancondition.setVisible(false);
					wMask.setVisible(false);
			}
			}
		}
		});
		
		var wMask = new Ext.form.TextField({fieldLabel:'Mask',anchor:'',flex:1,value:cell.getAttribute('mask')});
		
		var conditionStore = Ext.StoreMgr.get('successConditionStore');
		var wSuccesscondition = new  Ext.form.ComboBox({fieldLabel:'成功条件',anchor:'',flex:1,visiable:false,store:conditionStore,displayField: 'text',valueField: 'value',editable: false,mode: 'local',triggerAction: 'all',value:cell.getAttribute('successcondition')});
		
		var wSuccessNumberCondition = new  Ext.form.ComboBox({fieldLabel:'成功条件',anchor:'',flex:1,visiable:false,store:Ext.StoreMgr.get('successNumberConditionStore'),displayField: 'text',valueField: 'value',editable: false,mode: 'local',triggerAction: 'all',value:cell.getAttribute('successnumbercondition')});
		
		var  BooleanconditionStore =new Ext.data.JsonStore({fields: ['value', 'text'],
			data:[{value:'true',text:'如果值是True'},{value:'false',text:'如果值是false'}]}); 
		var wSuccessBooleancondition = new  Ext.form.ComboBox({fieldLabel:'成功条件',anchor:'',flex:1,visiable:false,store:BooleanconditionStore,displayField: 'text',valueField: 'value',editable: false,mode: 'local',triggerAction: 'all',value:cell.getAttribute('successbooleancondition')});
		
		var wcomparevalue = new Ext.form.TextField({fieldLabel:'值',anchor:'',flex:1,value:cell.getAttribute('comparevalue')});
		
		if(wFieldtype.getValue()=='boolean'){
			wcomparevalue.setVisible(false);
			wSuccesscondition.setVisible(false);
			wSuccessNumberCondition.setVisible(false);
			wSuccessBooleancondition.setVisible(true);
			wMask.setVisible(false);
		}else if(wFieldtype.getValue()=='string'){
			wcomparevalue.setVisible(true);
			wSuccesscondition.setVisible(true);
			wSuccessNumberCondition.setVisible(false);
			wSuccessBooleancondition.setVisible(false);
			wMask.setVisible(false);
		}else if(wFieldtype.getValue()=='datetime'){
			wcomparevalue.setVisible(true);
			wSuccesscondition.setVisible(false);
			wSuccessNumberCondition.setVisible(true);
			wSuccessBooleancondition.setVisible(false);
			wMask.setVisible(true);
		}else if(wFieldtype.getValue()=='number'){
			wcomparevalue.setVisible(true);
			wSuccesscondition.setVisible(false);
			wSuccessNumberCondition.setVisible(true);
			wSuccessBooleancondition.setVisible(false);
			wMask.setVisible(false);
	};
		
		var wSuccessWhen = new Ext.form.Checkbox({fieldLabel:'Success when varible set',anchor:'-10',flex:1,checked:cell.getAttribute('successwhenvarset')=='Y',
			listeners:{
				'check':function(checked){
					if(checked.checked){
						wFieldtype.setVisible(false);
						wSuccesscondition.setVisible(false);
						wcomparevalue.setVisible(false);
						wMask.setVisible(false);
					}else{
						wFieldtype.setVisible(true);
						if(wFieldtype.getValue()=='boolean'){
							wcomparevalue.setVisible(false);
							wSuccessBooleancondition.setVisible(false);
							wMask.setVisible(false);
						}else if(wFieldtype.getValue()=='string'){
							wcomparevalue.setVisible(true);
							wSuccesscondition.setVisible(true);
							wSuccessNumberCondition.setVisible(false);
							wSuccessBooleancondition.setVisible(false);
							wMask.setVisible(false);
						}else if(wFieldtype.getValue()=='datetime') {
							wcomparevalue.setVisible(true);
							wSuccesscondition.setVisible(false);
							wSuccessNumberCondition.setVisible(true);
							wSuccessBooleancondition.setVisible(false);
							wMask.setVisible(true);
						}else{
							wcomparevalue.setVisible(true);
							wSuccesscondition.setVisible(false);
							wSuccessNumberCondition.setVisible(true);
							wSuccessBooleancondition.setVisible(false);
							wMask.setVisible(false);
						}
						
					}
				}
			}
		});
		if(wSuccessWhen.getValue()){
			wFieldtype.setVisible(false);
			wSuccesscondition.setVisible(false);
			wcomparevalue.setVisible(false);
		}else{
			wFieldtype.setVisible(true);
			if(wFieldtype.getValue()=='boolean'){
				wcomparevalue.setVisible(false);
				wSuccessBooleancondition.setVisible(false);
				wMask.setVisible(false);
			}else if(wFieldtype.getValue()=='string'){
				wcomparevalue.setVisible(true);
				wSuccesscondition.setVisible(true);
				wSuccessNumberCondition.setVisible(false);
				wSuccessBooleancondition.setVisible(false);
				wMask.setVisible(false);
			}else if(wFieldtype.getValue()=='datetime') {
				wcomparevalue.setVisible(true);
				wSuccesscondition.setVisible(false);
				wSuccessNumberCondition.setVisible(true);
				wSuccessBooleancondition.setVisible(false);
				wMask.setVisible(true);
			}else{
				wcomparevalue.setVisible(true);
				wSuccesscondition.setVisible(false);
				wSuccessNumberCondition.setVisible(true);
				wSuccessBooleancondition.setVisible(false);
				wMask.setVisible(false);
			}
			
		};
		if(wEvaluate.getValue()=='variable'){
			wSuccessWhen.setVisible(true);
			wFieldName.setVisible(false);
			wVariablename.setVisible(true)
		}else{
			wSuccessWhen.setVisible(false);
			wFieldName.setVisible(true);
			wVariablename.setVisible(false);
		};
		this.tabItems =[
		                {
		                	xtype: 'KettleForm',
		        			title: 'General',
		        			bodyStyle: 'padding: 10px 10px',
		        			labelWidth: 130,
		        			items:[{
		        				xtype: 'fieldset',
		        				bodyStyle: 'padding: 10px 10px',
		        				title: '源',
		        				anchor: '-10',
		        				items:[wEvaluate,wFieldName,wVariablename,wFieldtype,wMask]
		        			},{
		        				xtype: 'fieldset',
		        				bodyStyle: 'padding: 10px 10px',
		        				title: '成功条件',
		        				anchor: '-10',
		        				items:[wSuccessWhen,wSuccesscondition,wSuccessNumberCondition,wSuccessBooleancondition,wcomparevalue]
		        			}]
		                }
		                ];
		SimpleEvalDialog.superclass.initComponent.call(this);
	}
});

Ext.reg("SIMPLE_EVAL",SimpleEvalDialog);