SequenceDialog = Ext.extend(KettleDialog, {
	title: BaseMessages.getString(PKG, "AddSequenceDialog.Shell.Title"),
	width: 600,
	height: 460,
	initComponent: function() {
		var wValuename = new Ext.form.TextField({fieldLabel: BaseMessages.getString(PKG, "AddSequenceDialog.Valuename.Label"), anchor: '-15'});
		var wUseDatabase = new Ext.form.Checkbox({fieldLabel: BaseMessages.getString(PKG, "AddSequenceDialog.UseDatabase.Label")});
		var wbSequence = new Ext.form.Checkbox({fieldLabel: BaseMessages.getString(PKG, "AddSequenceDialog.UseCounter.Label")});
		
		var wConnection = new Ext.form.ComboBox({
			flex: 1,
			displayField: 'name',
			valueField: 'name',
			typeAhead: true,
			disabled: true,
	        mode: 'remote',
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: getActiveGraph().getDatabaseStoreAll()
		});
		var wSchema = new Ext.form.TextField({ flex: 1, disabled: true});
		var wSeqname = new Ext.form.TextField({ flex: 1, disabled: true});
		
		var wCounterName = new Ext.form.TextField({fieldLabel: BaseMessages.getString(PKG, "AddSequenceDialog.CounterName.Label"), anchor: '-10', emptyText: '可选'});
		var wStartAt = new Ext.form.NumberField({fieldLabel: BaseMessages.getString(PKG, "AddSequenceDialog.StartAt.Label"), anchor: '-10'});
		var wIncrBy = new Ext.form.NumberField({fieldLabel: BaseMessages.getString(PKG, "AddSequenceDialog.StartAt.Label"), anchor: '-10'});
		var wMaxVal = new Ext.form.NumberField({fieldLabel: BaseMessages.getString(PKG, "AddSequenceDialog.MaxVal.Label"), anchor: '-10'});
		
		this.initData = function() {
			var cell = this.getInitData();
			SequenceDialog.superclass.initData.apply(this, [cell]);
			
			wValuename.setValue(cell.getAttribute('valuename'));
			wUseDatabase.setValue(cell.getAttribute('useDatabase') == 'Y');
			wbSequence.setValue(cell.getAttribute('use_counter') == 'Y');
			wConnection.setValue(cell.getAttribute('connection'));
			wSchema.setValue(cell.getAttribute('schema'));
			wSeqname.setValue(cell.getAttribute('seqname'));
			wCounterName.setValue(cell.getAttribute('counter_name'));
			wStartAt.setValue(cell.getAttribute('start_at'));
			wIncrBy.setValue(cell.getAttribute('increment_by'));
			wMaxVal.setValue(cell.getAttribute('max_value'));
		};
		
		this.saveData = function(){
			var data = {};
			data.valuename = wValuename.getValue();
			data.useDatabase = wUseDatabase.getValue() ? 'Y' : 'N';
			data.use_counter = wbSequence.getValue() ? 'Y' : 'N';
			data.connection = wConnection.getValue();
			data.schema = wSchema.getValue();
			data.seqname = wSeqname.getValue();
			data.counter_name = wCounterName.getValue();
			data.start_at = wStartAt.getValue();
			data.increment_by = wIncrBy.getValue();
			data.max_value = wMaxVal.getValue();
			
			return data;
		};
		
		wUseDatabase.on('check', function(cb, checked) {
			if(checked === true) {
				wConnection.enable();
				wSchema.enable();
				wSeqname.enable();
				
				wbSequence.setValue(false);
			} else {
				wConnection.disable();
				wSchema.disable();
				wSeqname.disable();
			}
		});
		
		wbSequence.on('check', function(cb, checked) {
			if(checked === true) {
				wCounterName.enable();
				wStartAt.enable();
				wIncrBy.enable();
				wMaxVal.enable();
				
				wUseDatabase.setValue(false);
			} else {
				wCounterName.disable();
				wStartAt.disable();
				wIncrBy.disable();
				wMaxVal.disable();
			}
		});
		
		this.fitItems = {
				layout: 'border',
				border: false,
				defaults: {border: false},
				items: [{
					xtype: 'KettleForm',
					region : 'north',
					height: 25,
					bodyStyle: 'padding: 0px',
					labelWidth: 95,
					items: [wValuename]
				}, {
					xtype: 'KettleForm',
					region : 'center',
					labelWidth: 170,
					bodyStyle: 'padding: 5px 15px',
					items: [{
						title: BaseMessages.getString(PKG, "AddSequenceDialog.UseDatabaseGroup.Label"),
						xtype: 'fieldset',
						items: [wUseDatabase, {
							xtype: 'compositefield',
							fieldLabel: BaseMessages.getString(PKG, "AddSequence.Log.ConnectedDB"),
							anchor: '-10',
							items: [wConnection, {
								xtype: 'button', text: '编辑...', handler: function() {
									var databaseDialog = new DatabaseDialog();
									databaseDialog.on('create', onDatabaseCreate);
									databaseDialog.show(null, function() {
										databaseDialog.initTransDatabase(wConnection.getValue());
									});
								}
							}, {
								xtype: 'button', text: '新建...', handler: function() {
									var databaseDialog = new DatabaseDialog();
									databaseDialog.on('create', onDatabaseCreate);
									databaseDialog.show(null, function() {
										databaseDialog.initTransDatabase(null);
									});
								}
							}, {
								xtype: 'button', text: '向导...'
							}]
						},{
							fieldLabel: BaseMessages.getString(PKG, "AddSequenceDialog.TargetSchema.Label"),
							xtype: 'compositefield',
							anchor: '-10',
							items: [wSchema, {
								xtype: 'button', text: '浏览...', scope: this, handler: function() {
									this.selectSchema(wConnection, wSchema);
								}
							}]
						},{
							fieldLabel: BaseMessages.getString(PKG, "AddSequenceDialog.Seqname.Label"),
							xtype: 'compositefield',
							anchor: '-10',
							items: [wSeqname, {
								xtype: 'button', text: '浏览...', handler: function() {
//									me.selectTable(wConnection, wSchema, wTable);
								}
							}]
						}]
					}, {
						title: BaseMessages.getString(PKG, "AddSequenceDialog.UseCounterGroup.Label"),
						xtype: 'fieldset',
						items: [wbSequence, wCounterName, wStartAt, wIncrBy, wMaxVal]
					}]
				}]
		};
		
		SequenceDialog.superclass.initComponent.call(this);
	},
	
	selectSchema: function(wConnection, wSchema) {
		/*var store = getActiveGraph().getDatabaseStore();
		store.each(function(item) {
			if(item.get('name') == wConnection.getValue()) {
				var dialog = new DatabaseExplorerDialog({includeElement: 1});
				dialog.on('select', function(schema) {
					wSchema.setValue(schema);
					dialog.close();
				});
				dialog.show(null, function() {
					dialog.initDatabase(item.json);
				});
				return false;
			}
		});*/
		var dialog = new DatabaseExplorerDialog({includeElement: 1});
		dialog.on('select', function(schema) {
			wSchema.setValue(schema);
			dialog.close();
		});
		dialog.show(null, function() {
			dialog.initDatabase(wConnection.getValue());
		});
		return false;
	}
});

Ext.reg('Sequence', SequenceDialog);