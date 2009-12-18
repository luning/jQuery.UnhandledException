;(function($) {
	$.runtimeErrorLog = [];
	var logError = function(errorMessage, fileName, lineNumber) {
		$.runtimeErrorLog.push(errorMessage + ", in " + fileName + "(line " + lineNumber + ")");
	};
	var logException = function(ex) {
		logError(ex.name + " : " + ex.message, ex.fileName, ex.lineNumber);
	};
 
	var originalOnError = window.onerror;
	window.onerror = function(errorMessage, fileName, lineNumber) {
		logError(errorMessage, fileName, lineNumber);
		if (originalOnError) {
			return originalOnError.apply(this, arguments);
		}
	};
 
	// if it's Mozilla, Opera or webkit
	if (document.addEventListener) {
		var originalBind = $.fn.bind;
		var originalReady = $.fn.ready;
		$.fn.extend({
			bind: function(type, data, fn) {
				var proxy = jQuery.event.proxy(fn || data, function(event) {
					try {
						return (fn || data).apply(this, arguments);
					} catch (ex) {
						logException(ex);
						throw ex;
					}
				});
				var hasFn = !!fn;
				return originalBind.call(this, type, hasFn ? data : proxy, hasFn ? proxy : undefined);
			},
			ready: function(fn) {
				var handler = fn;
				if (!$.isReady) {
					handler = function() {
						try {
							fn.apply(document, arguments);
						} catch (ex) {
							logException(ex);
							throw ex;
						}
					};
				}
				return originalReady.call(this, handler);
			}
		});
	}
})(jQuery);
