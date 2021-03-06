(function($){
	$(document).ready(function($) {

		var $custom_metadata_field = $( '.custom-metadata-field' ),
			$custom_metadata_multifield = $( '.custom-metadata-multifield' );

		var initMultiselectSortable = function() {
			$('.select2-sortable').each(function() {
				var select = $(this);
				var values = $.makeArray(jQuery.parseJSON($(this).attr('data-possible-values')));
				$(this).select2({
					data: values,
					multiple: true
				});

				$(this).select2("container").find("ul.select2-choices").sortable({
					containment: 'parent',
					start: function() { select.select2('onSortStart'); },
					update: function() { select.select2('onSortEnd'); }
				});
			});
		};

		initMultiselectSortable();

		var incrementor = function(v) {
			return v.replace( /[0-9]+(?!.*[0-9])/ , function( match ) {
				return parseInt(match, 10) + 1;
			});
		};

		var destroy_date_pickers = function( ) {
			var $datepickers = $( '.custom-metadata-field.datepicker input' ),
				$datetimepickers = $( '.custom-metadata-field.datetimepicker input' ),
				$timepickers = $( '.custom-metadata-field.timepicker input' );

			$datepickers.each(function() {
				var $this = $(this);
				if( $this.hasClass('hasDatepicker') ) {
					$this.datepicker( 'destroy' );
					$this.removeClass('hasDatepicker');
				}
			});

			$datetimepickers.each(function() {
				var $this = $(this);
				if( $this.hasClass('hasDatepicker') ) {
					$this.datetimepicker( 'destroy' );
					$this.removeClass('hasDatepicker');
				}
			});

			$timepickers.each(function() {
				var $this = $(this);
				if( $this.hasClass('hasDatepicker') ) {
					$this.timepicker( 'destroy' );
					$this.removeClass('hasDatepicker');
				}
			});
		};

		var bind_date_pickers = function() {

			var $datepickers = $( '.custom-metadata-field.datepicker input' ),
				$datetimepickers = $( '.custom-metadata-field.datetimepicker input' ),
				$timepickers = $( '.custom-metadata-field.timepicker input' );

			// init the datepicker fields
			$datepickers.datepicker({
				changeMonth: true,
				changeYear: true
			});

			// init the datetimepicker fields
			$datetimepickers.datetimepicker({
				changeMonth: true,
				changeYear: true
			});

			// init the timepicker fields
			$timepickers.timepicker({
				changeMonth: true,
				changeYear: true
			});
		};

		// duplicating fields
		$custom_metadata_field.on( 'click.custom_metadata', '.add-multiple', function(e){
			e.preventDefault();
			var $this = $( this ),
				$last = $this.parent().prev( '.cloneable' ),
				$clone = $last.clone(),
				id_name = $clone.attr('id'),
				split_id = id_name.split( '-' ),
				instance_num = parseInt( split_id[1] ) + 1;

			id_name = split_id[0] + '-' + instance_num;
			$clone.attr( 'id', id_name );
			$clone.insertAfter( $last ).hide().fadeIn().find( ':input' ).not( 'type="button"' ).val(''); // todo: figure out if default value
		});

		// deleting fields
		$custom_metadata_field.on( 'click.custom_metadata', '.del-multiple', function(e){
			e.preventDefault();
			var $this = $( this );
			$this.parent().fadeOut('normal', function(){
				$(this).remove();
			});
		});

		// init upload fields
		var custom_metadata_file_frame;
		$custom_metadata_field.on( 'click.custom_metadata', '.custom-metadata-upload-button', function(e) {
			e.preventDefault();

			var $this = $(this),
				$this_field = $this.parent();

			// if the media frame doesn't exist yet, create it
			if ( ! custom_metadata_file_frame ) {
				custom_metadata_file_frame = wp.media.frames.file_frame = wp.media({
					title: $this.data( 'uploader-title' ),
					button: {
						text: $this.data( 'uploader-button-text' )
					},
					multiple: false
				});
			}

			// unbind prior events first
			custom_metadata_file_frame.off( 'select' );

			custom_metadata_file_frame.on( 'select', function() {
				attachment = custom_metadata_file_frame.state().get( 'selection' ).first().toJSON();
				$this_field.find( '.custom-metadata-upload-url' ).val( attachment.url );
				$this_field.find( '.custom-metadata-upload-id' ).val( attachment.id );
			});

			custom_metadata_file_frame.open();
		});

		$custom_metadata_field.on( 'click.custom_metadata', '.custom-metadata-clear-button', function(e){
			e.preventDefault();
			var $this = $(this),
			$this_field = $this.parent();
			$this_field.find( 'input:not( [type=button] )' ).val( '' );
		});

		// init link fields
		var custom_metadata_link_selector_is_open = false;
		var custom_metadata_link_selector_target = null;

		$custom_metadata_field.on( 'click.custom_metadata', '.custom-metadata-link-button', function(e){
			e.preventDefault();
			custom_metadata_link_selector_is_open = true;
			custom_metadata_link_selector_target = $(this).parent().find( 'input[type="text"]' );
			wpActiveEditor = true;
			wpLink.open();
			var $wp_link = $( '#wp-link' );
			wpLink.textarea = custom_metadata_link_selector_target;
			$wp_link.find( '.link-target' ).remove(); // remove the "new tab" checkbox
			$wp_link.find( '#link-title-field' ).parents( '#link-options div' ).remove(); // remove the "title" field
		});

		$(document).on( 'click.custom_metadata', '#wp-link-submit', function(e){
			e.preventDefault();
			if ( null === custom_metadata_link_selector_target)
				return;

			var linkAtts = wpLink.getAttrs();
			custom_metadata_link_selector_target.val(linkAtts.href);
			wpLink.textarea = custom_metadata_link_selector_target;
			wpLink.close();
			custom_metadata_link_selector_target = null;
		});

		$(document).on( 'click.custom_metadata', '#wp-link-cancel, .ui-dialog-titlebar-close', function(e){
			e.preventDefault();
			if ( null === custom_metadata_link_selector_target)
				return;

			wpLink.textarea = custom_metadata_link_selector_target;
			wpLink.close();
			custom_metadata_link_selector_target = null;
			custom_metadata_link_selector_is_open = false;
		});

		// First initialization of datepickers
		bind_date_pickers();

		// select2
		$custom_metadata_field.find( '.custom-metadata-select2' ).each(function(index) {
			$(this).select2({ placeholder : $(this).attr('data-placeholder'), allowClear : true });
		});


		/* MULTIFIELDS */

		// reset field names, container ids, etc
		var multifield_after_change = function( $container ) {
			var $slug = $container.attr( 'data-slug' ),
				$groupings = $container.find('.custom-metadata-multifield-grouping');

			$groupings = $container.find('.custom-metadata-multifield-grouping');

			$.each( $groupings, function( i, grouping ){

				var $grouping = $( grouping ),
					$fields = $grouping.find('.custom-metadata-field'),
					num = i + 1;

				$grouping.attr( 'id', $slug + '-' + num );

				$.each( $fields, function( j, field ){
					var $field = $( field ),
						$field_slug = $field.attr( 'data-slug' ),
						$label = $field.find( 'label' ),
						$div = $field.find( 'div' ),
						$field_inputs = $field.find( ':input:not(:button)' ),
						$field_id = $field_slug + '-' + num;

					$label.attr( 'for', $field_id );
					$div.attr( 'id', $field_id + '-1' ).attr( 'class', $field_id );

					$.each( $field_inputs, function( k, field_input ){
						
						var $field_input = $( field_input );
						
						if ( ! _.isEmpty( $field_input.attr( 'id' ) ) ) {
							$field_input.attr( 'id', $field_id );
						}

						if ( ! _.isEmpty( $field_input.attr( 'name' ) ) ) {
							$field_input.attr( 'name', $slug + '[' + i + '][' + $field_slug + ']');
						}
					});

				});

			});
		};

		// Adds sortable functionality to multifields
		$('.custom-metadata-multifield').sortable({
		    items: '.custom-metadata-multifield-grouping',
		    handle: '.sort-handle'
		});

		$('.custom-metadata-multifield').sortable().bind('sortupdate', function(e) {
			multifield_after_change( $(this) );
		});

		// adding multifields
		$custom_metadata_multifield.on( 'click.custom_metadata', '.custom-metadata-multifield-add', function(e){
			e.preventDefault();

			destroy_date_pickers();

			var $this = $( this ),
				$container = $this.parents('.custom-metadata-multifield'),
				$elements = $container.find('.custom-metadata-multifield-grouping'),
				$element_to_clone = $elements.first(),
				$clone = $element_to_clone.clone(true);

			$clone.find( ':input:not(:button)' ).val('');
			$clone.insertAfter( $elements.last() ).hide();

			multifield_after_change( $container );
			bind_date_pickers();

			$clone.fadeIn();

		});

		// cloning multifields
		$custom_metadata_multifield.on( 'click.custom_metadata', '.custom-metadata-multifield-clone', function(e){
			
			e.preventDefault();

			destroy_date_pickers();

			var $this = $( this ),
				$element_to_clone = $this.parents('.custom-metadata-multifield-grouping'),
				$container = $this.parents('.custom-metadata-multifield'),
				$clone = $element_to_clone.clone(true);

			$clone.insertAfter( $element_to_clone ).hide();

			multifield_after_change( $container );
			bind_date_pickers();

			$clone.fadeIn();

		});

		// deleting multifields
		$custom_metadata_multifield.on( 'click.custom_metadata', '.custom-metadata-multifield-delete', function(e){
			e.preventDefault();
			destroy_date_pickers();
			var $this = $( this ),
				$element_to_delete = $this.parents('.custom-metadata-multifield-grouping'),
				$container = $this.parents('.custom-metadata-multifield');

			if( $container.find('.custom-metadata-multifield-grouping').length === 1 ) {
				$element_to_delete.find( ':input:not(:button)' ).val('');
			} else {
				$element_to_delete.fadeOut('normal', function(){
					$(this).remove();
					multifield_after_change( $container );
				});
			}
			bind_date_pickers();
		});

	});
})(jQuery);