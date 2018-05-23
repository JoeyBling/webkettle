Normaliser = Ext.extend(KettleDialog, {
    title: '行转列',
    width: 600,
    height: 400,
    initComponent: function() {
        var me = this, cell = getActiveGraph().getGraph().getSelectionCell();

        var fieldStore = new Ext.data.JsonStore({
            fields: ['name', 'value','norm'],
            data: Ext.decode(cell.getAttribute('fields'))
        });
        this.saveData = function(){
            var data = {
                typefield:wTypeField.getValue(),
                fields:Ext.encode(fieldStore.toJson())
            };
            return data;
        };
        var wTypeField=new Ext.form.TextField({  region: 'north',fieldLabel: 'key字段', anchor: '-10', value:cell.getAttribute('typefield')});
        var editorGridTarget=new KettleEditorGrid({
            height: 300,
            region: 'center',
            xtype: 'KettleEditorGrid',
            columns: [new Ext.grid.RowNumberer(),
                {
                    header:"字段名", dataIndex: 'name', width:200,
                    editor: new Ext.form.ComboBox({
                        displayField: 'name',
                        valueField: 'name',
                        typeAhead: true,
                        forceSelection: true,
                        triggerAction: 'all',
                        selectOnFocus:true,
                        store: getActiveGraph().inputFields(cell.getAttribute('label'))
                    })
                },{
                    header:"key 值",dataIndex: 'value',editor:new Ext.form.TextField()
                },{
                    header:"value 字段",dataIndex: 'norm',editor:new Ext.form.TextField()
                }
            ],
            tbar: [{
                text: '获取字段', handler: function(btn) {
                    getActiveGraph().inputOutputFields(cell.getAttribute('label'), true, function(store) {
                        fieldStore.merge(store, [{name: 'name', field: 'name'},{name:'value',field:'name'}]);
                    });
                }
            }],
            store:fieldStore
        })

        this.fitItems = {
            layout: 'border',
            border: false,
            items: [wTypeField,editorGridTarget]
        };

        Normaliser.superclass.initComponent.call(this);
    }
});

Ext.reg('Normaliser', Normaliser);