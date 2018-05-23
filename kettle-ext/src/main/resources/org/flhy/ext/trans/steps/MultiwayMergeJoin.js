MultiMergeJoinDialog = Ext.extend(KettleDialog, {
	title: '过滤记录',
	width: 600,
	height: 400,
	initComponent: function() {
		
		var formItems = [], graph = getActiveGraph().getGraph();
		
		var joinTypeCombo = new Ext.form.ComboBox({
			fieldLabel: 'Join Type',
			width: 146,
			displayField: 'name',
			valueField: 'name',
			typeAhead: true,
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: Ext.StoreMgr.get('multijointypeStore')
	    });
		var wInputStepArray = [], keyValTextBox = [];
		
		Ext.each(graph.getIncomingEdges(graph.getSelectionCell()), function(edge, index) {
			var combo = new Ext.form.ComboBox({
				flex: 1,
				displayField: 'name',
				valueField: 'name',
				typeAhead: true,
		        forceSelection: true,
		        triggerAction: 'all',
		        selectOnFocus:true,
				store: getActiveGraph().previousSteps(cell.getAttribute('label'))
			});
			wInputStepArray.push(combo);
			
			var tf = new Ext.form.TextField({flex: 1});
			keyValTextBox.push(tf);
			
			formItems.push({
				xtype: 'compositefield',
				fieldLabel: 'Input Step ' + (index + 1),
				items: [combo, {
					xtype: 'label',
					text: 'Join Keys：',
					style: 'line-height: 20px;text-align: right;',
					width: 80
				}, tf, {
					xtype: 'button', text: 'Select Keys', handler: function() {
						
						var store = new Ext.data.JsonStore({
							fields: ['name']
						})
						
						var grid = new KettleEditorGrid({
							border: false,
							menuAdd: function(menu) {
								menu.insert(0, {
									text: '获取字段', handler: function() {
										getActiveGraph().inputOutputFields(combo.getValue(), false, function(s) {
											store.merge(s, 'name');
										});
									}
								});
								
								menu.insert(1, '-');
							},
							columns: [new Ext.grid.RowNumberer(), {
								header: 'Key field', dataIndex: 'name', width: 100, editor: new Ext.form.ComboBox({
									displayField: 'name',
									valueField: 'name',
									typeAhead: true,
							        forceSelection: true,
							        triggerAction: 'all',
							        selectOnFocus:true,
									store: getActiveGraph().outputFields(combo.getValue())
								})
							}],
							store: store
						});
						
						var win = new Ext.Window({
							title: 'Join Keys',
							width: 200,
							height: 300,
							layout: 'fit',
							modal: true,
							closeAction: 'close',
							items: grid,
							bbar: ['->', {
								text: '确定', handler: function() {
									var arr = [];
									store.each(function(rec) {
										arr.push(rec.get('name'));
									});
									tf.setValue(arr.join(','));
									
									win.close();
								}
							}]
						});
						
						win.show();
					}
				}]
			});
		});
		formItems.push(joinTypeCombo);
		
		var exists = function(name) {
			var edges = graph.getIncomingEdges(graph.getSelectionCell());
			for(var i=0 ;i<edges.length; i++) {
				var edge = edges[i];
				if(edge.source.getAttribute('label') == name)
					return true;
			}
			return false;
		};
		
		this.initData = function() {
			var cell = this.getInitData();
			MultiMergeJoinDialog.superclass.initData.apply(this, [cell]);
			
			joinTypeCombo.setValue(cell.getAttribute('join_type'));
			
			var stepnames = Ext.decode(cell.getAttribute('stepnames'));
			var keys = Ext.decode(cell.getAttribute('keys'));
			for(var i=0, j = 0; i<stepnames.length; i++) {
				if(exists(stepnames[i])) {
					wInputStepArray[j].setValue(stepnames[i]);
					keyValTextBox[j].setValue(keys[i]);
					j++;
				}
			}
		};
		
		this.saveData = function(){
			var data = {};
			data.join_type = joinTypeCombo.getValue();
			
			var stepnames = [], keys = [];
			for(var i=0; i<wInputStepArray.length; i++) {
				var stepname = wInputStepArray[i].getValue();
				if(!Ext.isEmpty(stepname)) {
					stepnames.push(stepname);
					keys.push(keyValTextBox[i].getValue());
				}
			}
			data.stepnames = Ext.encode(stepnames);
			data.keys = Ext.encode(keys);
			
			return data;
		};
		
		this.fitItems = new KettleForm({
			labelWidth: 80,
			bodyStyle: 'padding: 15px',
			items: formItems
		});
		
		MultiMergeJoinDialog.superclass.initComponent.call(this);
	}
});

Ext.reg('MultiwayMergeJoin', MultiMergeJoinDialog);