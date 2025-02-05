/* globals I18n animateSpinner HelperModule */

(function() {
  'use strict';

  var INVENTORY_PICKER;
  var COLUMN_PICKER;
  var ITEM_PICKER;
  var SELECTED_IDS = {
    repository_id: null,
    respository_column_id: null,
    repository_item_id: null
  };

  function clearErrors() {
    var $columnsAlertSection = $('#save-PDF-to-inventory-column-warnings');
    var $itemsAlertSection = $('#save-PDF-to-inventory-warnings');
    $itemsAlertSection.empty();
    $columnsAlertSection.empty();
  }

  function toggleHasFileErrorMessage(value) {
    var element = $('#selectInventoryItem [value="' + value + '"]');
    var $alertSection = $('#save-PDF-to-inventory-warnings');
    $alertSection.empty();
    if (element.data('hasfile')) {
      $alertSection.append(
        `<div class="alert alert-danger">
        ${I18n.t('projects.reports.new.save_PDF_to_inventory_modal.asset_present_warning_html')}
        </div>`
      );
    }
  }

  function appendSearchResults(data) {
    var items = [];
    if (data.hasOwnProperty('results')) {
      $.each(data.results, function(index, el) {
        items.push(
          {
            value: el.id,
            text: el.name,
            disabled: false
          }
        );
      });
    }
    return items;
  }

  function appendSearchResultsForItems(data) {
    var items = [];
    if (data.hasOwnProperty('results')) {
      $('#selectInventoryItem').parent().find('button').attr('disabled', false);
      $.each(data.results, function(index, el) {
        items.push(
          {
            value: el.id,
            text: el.name,
            disabled: false,
            data: {
              hasFile: el.hasOwnProperty('has_file_attached') ? el.has_file_attached : null
            }
          }
        );
      });
    } else {
      $('#selectInventoryItem').parent().find('button').attr('disabled', true);
      clearErrors();
      $('#save-PDF-to-inventory-warnings').append(
        `<strong class="danger">${data.no_items}</strong>`
      );
    }
    return items;
  }

  function appendSearchResultsForColumns(data) {
    var items = [];
    if (data.hasOwnProperty('results')) {
      $('#selectInventoryColumn').parent().find('button').attr('disabled', false);
      $.each(data.results, function(index, el) {
        items.push(
          {
            value: el.id,
            text: el.name,
            disabled: false
          }
        );
      });
    } else {
      $('#selectInventoryColumn').parent().find('button').attr('disabled', true);
      clearErrors();
      $('#save-PDF-to-inventory-column-warnings').append(
        `<div class="save-PDF-to-inventory-alerts"><strong class="danger">${data.no_items}</strong></div>`
      );
    }
    return items;
  }

  function submitButtonEnableToggle(status) {
    var button = $('#savePDFtoInventorySubmit');
    if (status) {
      button.attr('disabled', false);
    } else {
      button.attr('disabled', true);
    }
  }

  function deselect(element) {
    if (element) {
      element.selectpicker('val', null);
      element.selectpicker('render');
      element.attr('disabled', true);
    }
  }

  // triggers first request and cleans the dropdown selectpicker
  function clearDropdownResultsCallback(element) {
    element.parent().find('button').on('click', function() {
      $(this).parent().find('input').trigger('keyup');
    });
  }

  function initInventoryItemSelectPicker() {
    ITEM_PICKER = $('#selectInventoryItem')
      .attr('disabled', false)
      .selectpicker({ liveSearch: true })
      .ajaxSelectPicker({
        ajax: {
          url: $('#selectInventoryItem').data('target-url'),
          type: 'POST',
          dataType: 'json',
          data: function() {
            return {
              q: '{{{q}}}',
              repository_id: SELECTED_IDS.repository_id,
              repository_column_id: SELECTED_IDS.respository_column_id
            };
          }
        },
        locale: {
          emptyTitle: I18n.t('projects.reports.new.save_PDF_to_inventory_modal.nothing_selected')
        },
        preprocessData: appendSearchResultsForItems,
        emptyRequest: true,
        clearOnEmpty: true,
        cache: false,
        preserveSelected: false
      })
      .on('change.bs.select', function(el) {
        var value = el.target.value;
        toggleHasFileErrorMessage(value);
        submitButtonEnableToggle(true);
        SELECTED_IDS.repository_item_id = value;
      });
    clearDropdownResultsCallback(ITEM_PICKER);
  }

  function initInventoryColumnSelectPicker() {
    COLUMN_PICKER = $('#selectInventoryColumn')
      .attr('disabled', false)
      .selectpicker({ liveSearch: true })
      .ajaxSelectPicker({
        ajax: {
          url: $('#selectInventoryColumn').data('target-url'),
          type: 'POST',
          dataType: 'json',
          data: function() {
            return {
              q: '{{{q}}}',
              repository_id: SELECTED_IDS.repository_id
            };
          }
        },
        locale: {
          emptyTitle: I18n.t('projects.reports.new.save_PDF_to_inventory_modal.nothing_selected')
        },
        preprocessData: appendSearchResultsForColumns,
        emptyRequest: true,
        clearOnEmpty: true,
        cache: false,
        preserveSelected: false
      })
      .on('change.bs.select', function(el) {
        SELECTED_IDS.respository_column_id = el.target.value;
        deselect(ITEM_PICKER);
        submitButtonEnableToggle(false);
        initInventoryItemSelectPicker();
        // refresh the dropdown state
        $('#selectInventoryItem').parent().find('input').trigger('keyup');
        clearErrors();
      });
    clearDropdownResultsCallback(COLUMN_PICKER);
  }

  function initInventoriesSelectPicker() {
    INVENTORY_PICKER = $('#selectInventory')
      .selectpicker({ liveSearch: true })
      .ajaxSelectPicker({
        ajax: {
          url: $('#selectInventory').data('target-url'),
          type: 'POST',
          dataType: 'json',
          data: function() {
            return { q: '{{{q}}}' };
          }
        },
        locale: {
          emptyTitle: I18n.t('projects.reports.new.save_PDF_to_inventory_modal.nothing_selected')
        },
        preprocessData: appendSearchResults,
        emptyRequest: true,
        clearOnEmpty: false,
        cache: false,
        preserveSelected: false
      }).on('change.bs.select', function(el) {
        SELECTED_IDS.repository_id = el.target.value;
        deselect(COLUMN_PICKER);
        deselect(ITEM_PICKER);
        submitButtonEnableToggle(false);
        initInventoryColumnSelectPicker();
        clearErrors();
        // refresh the dropdown state
        $('#selectInventoryColumn').parent().find('input').trigger('keyup');
      });
    clearDropdownResultsCallback(INVENTORY_PICKER);
  }

  $('#content-reports-index').on('click', '#savePDFtoInventorySubmit', function() {
    animateSpinner();
    $.ajax({
      url: $('#savePDFtoInventorySubmit').data('target-url'),
      data: SELECTED_IDS,
      type: 'POST',
      success: function(data) {
        animateSpinner(null, false);
        HelperModule.flashAlertMsg(data.message, 'success');
        $('#savePDFtoInventory').modal('hide');
      },
      error: function(xhr) {
        animateSpinner(null, false);
        HelperModule.flashAlertMsg(xhr.responseJSON.message, 'danger');
        $('#savePDFtoInventory').modal('hide');
      }
    });
  });

  /*
   * INITIALIZERS
  */

  function initializeSavePDFtoInventoryModal() {
    $('#content-reports-index').on('shown.bs.modal', '#savePDFtoInventory', function() {
      initInventoriesSelectPicker();
      clearErrors();
      // refresh the dropdown state
      $('#selectInventory').parent().find('input').trigger('keyup');
    }).on('hidden.bs.modal', function() {
      // clear ids
      SELECTED_IDS = {
        repository_id: null,
        respository_column_id: null,
        repository_item_id: null
      };
      // clear select picker objects

      if (COLUMN_PICKER) {
        deselect(COLUMN_PICKER);
      }

      if (ITEM_PICKER) {
        deselect(ITEM_PICKER);
      }
      submitButtonEnableToggle(false);
    });
  }

  initializeSavePDFtoInventoryModal();
}());
