/**
* DO NOT EDIT THIS FILE.
* See the following change record for more information,
* https://www.drupal.org/node/2815083
* @preserve
**/

(function ($, Drupal, document) {
  Drupal.editorConfiguration = {
    addedFeature: function addedFeature(feature) {
      $(document).trigger('drupalEditorFeatureAdded', feature);
    },
    removedFeature: function removedFeature(feature) {
      $(document).trigger('drupalEditorFeatureRemoved', feature);
    },
    modifiedFeature: function modifiedFeature(feature) {
      $(document).trigger('drupalEditorFeatureModified', feature);
    },
    featureIsAllowedByFilters: function featureIsAllowedByFilters(feature) {
      function emptyProperties(section) {
        return section.attributes.length === 0 && section.classes.length === 0 && section.styles.length === 0;
      }

      function generateUniverseFromFeatureRequirements(feature) {
        var properties = ['attributes', 'styles', 'classes'];
        var universe = {};

        for (var r = 0; r < feature.rules.length; r++) {
          var featureRule = feature.rules[r];
          var requiredTags = featureRule.required.tags;

          for (var t = 0; t < requiredTags.length; t++) {
            universe[requiredTags[t]] = {
              tag: false,
              touchedByAllowedPropertyRule: false
            };
          }

          if (emptyProperties(featureRule.required)) {
            continue;
          }

          for (var p = 0; p < properties.length; p++) {
            var property = properties[p];

            for (var pv = 0; pv < featureRule.required[property].length; pv++) {
              var propertyValue = featureRule.required[property];
              universe[requiredTags]["".concat(property, ":").concat(propertyValue)] = false;
            }
          }
        }

        return universe;
      }

      function findPropertyValueOnTag(universe, tag, property, propertyValue, allowing) {
        if (!universe.hasOwnProperty(tag)) {
          return false;
        }

        var key = "".concat(property, ":").concat(propertyValue);

        if (allowing) {
          universe[tag].touchedByAllowedPropertyRule = true;
        }

        if (propertyValue.indexOf('*') === -1) {
          if (universe.hasOwnProperty(tag) && universe[tag].hasOwnProperty(key)) {
            if (allowing) {
              universe[tag][key] = true;
            }

            return true;
          }

          return false;
        }

        var atLeastOneFound = false;
        var regex = key.replace(/\*/g, '[^ ]*');
        Object.keys(universe[tag]).forEach(function (key) {
          if (key.match(regex)) {
            atLeastOneFound = true;

            if (allowing) {
              universe[tag][key] = true;
            }
          }
        });
        return atLeastOneFound;
      }

      function findPropertyValuesOnAllTags(universe, property, propertyValues, allowing) {
        var atLeastOneFound = false;
        Object.keys(universe).forEach(function (tag) {
          if (findPropertyValuesOnTag(universe, tag, property, propertyValues, allowing)) {
            atLeastOneFound = true;
          }
        });
        return atLeastOneFound;
      }

      function findPropertyValuesOnTag(universe, tag, property, propertyValues, allowing) {
        if (tag === '*') {
          return findPropertyValuesOnAllTags(universe, property, propertyValues, allowing);
        }

        var atLeastOneFound = false;
        propertyValues.forEach(function (propertyValue) {
          if (findPropertyValueOnTag(universe, tag, property, propertyValue, allowing)) {
            atLeastOneFound = true;
          }
        });
        return atLeastOneFound;
      }

      function deleteAllTagsFromUniverseIfAllowed(universe) {
        var atLeastOneDeleted = false;
        Object.keys(universe).forEach(function (tag) {
          if (deleteFromUniverseIfAllowed(universe, tag)) {
            atLeastOneDeleted = true;
          }
        });
        return atLeastOneDeleted;
      }

      function deleteFromUniverseIfAllowed(universe, tag) {
        if (tag === '*') {
          return deleteAllTagsFromUniverseIfAllowed(universe);
        }

        if (universe.hasOwnProperty(tag) && Object.keys(universe[tag]).filter(function (key) {
          return key !== 'touchedByAllowedPropertyRule';
        }).every(function (key) {
          return universe[tag][key];
        })) {
          delete universe[tag];
          return true;
        }

        return false;
      }

      function anyForbiddenFilterRuleMatches(universe, filterStatus) {
        var properties = ['attributes', 'styles', 'classes'];
        var allRequiredTags = Object.keys(universe);
        var filterRule;

        for (var i = 0; i < filterStatus.rules.length; i++) {
          filterRule = filterStatus.rules[i];

          if (filterRule.allow === false) {
            var intersection = filterRule.tags.filter(function (tag) {
              return allRequiredTags.includes(tag);
            });

            if (intersection.length > 0) {
              return true;
            }
          }
        }

        for (var n = 0; n < filterStatus.rules.length; n++) {
          filterRule = filterStatus.rules[n];

          if (filterRule.restrictedTags.tags.length && !emptyProperties(filterRule.restrictedTags.forbidden)) {
            for (var j = 0; j < filterRule.restrictedTags.tags.length; j++) {
              var tag = filterRule.restrictedTags.tags[j];

              for (var k = 0; k < properties.length; k++) {
                var property = properties[k];

                if (findPropertyValuesOnTag(universe, tag, property, filterRule.restrictedTags.forbidden[property], false)) {
                  return true;
                }
              }
            }
          }
        }

        return false;
      }

      function markAllowedTagsAndPropertyValues(universe, filterStatus) {
        var properties = ['attributes', 'styles', 'classes'];
        var filterRule;
        var tag;

        for (var l = 0; Object.keys(universe).length > 0 && l < filterStatus.rules.length; l++) {
          filterRule = filterStatus.rules[l];

          if (filterRule.allow === true) {
            for (var m = 0; Object.keys(universe).length > 0 && m < filterRule.tags.length; m++) {
              tag = filterRule.tags[m];

              if (universe.hasOwnProperty(tag)) {
                universe[tag].tag = true;
                deleteFromUniverseIfAllowed(universe, tag);
              }
            }
          }
        }

        for (var i = 0; Object.keys(universe).length > 0 && i < filterStatus.rules.length; i++) {
          filterRule = filterStatus.rules[i];

          if (filterRule.restrictedTags.tags.length && !emptyProperties(filterRule.restrictedTags.allowed)) {
            for (var j = 0; Object.keys(universe).length > 0 && j < filterRule.restrictedTags.tags.length; j++) {
              tag = filterRule.restrictedTags.tags[j];

              for (var k = 0; k < properties.length; k++) {
                var property = properties[k];

                if (findPropertyValuesOnTag(universe, tag, property, filterRule.restrictedTags.allowed[property], true)) {
                  deleteFromUniverseIfAllowed(universe, tag);
                }
              }
            }
          }
        }
      }

      function filterStatusAllowsFeature(filterStatus, feature) {
        if (!filterStatus.active) {
          return true;
        }

        if (feature.rules.length === 0) {
          return true;
        }

        if (filterStatus.rules.length === 0) {
          return true;
        }

        var universe = generateUniverseFromFeatureRequirements(feature);

        if (anyForbiddenFilterRuleMatches(universe, filterStatus)) {
          return false;
        }

        markAllowedTagsAndPropertyValues(universe, filterStatus);

        if (filterStatus.rules.some(function (_ref) {
          var allow = _ref.allow;
          return allow;
        })) {
          if (Object.keys(universe).length === 0) {
            return true;
          }

          if (!Object.keys(universe).every(function (tagName) {
            return universe[tagName].tag;
          })) {
            return false;
          }

          var tags = Object.keys(universe);

          for (var i = 0; i < tags.length; i++) {
            var tag = tags[i];

            if (universe.hasOwnProperty(tag)) {
              if (universe[tag].touchedByAllowedPropertyRule === false) {
                delete universe[tag];
              }
            }
          }

          return Object.keys(universe).length === 0;
        }

        return true;
      }

      Drupal.filterConfiguration.update();
      return Object.keys(Drupal.filterConfiguration.statuses).every(function (filterID) {
        return filterStatusAllowsFeature(Drupal.filterConfiguration.statuses[filterID], feature);
      });
    }
  };

  Drupal.EditorFeatureHTMLRule = function () {
    this.required = {
      tags: [],
      attributes: [],
      styles: [],
      classes: []
    };
    this.allowed = {
      tags: [],
      attributes: [],
      styles: [],
      classes: []
    };
    this.raw = null;
  };

  Drupal.EditorFeature = function (name) {
    this.name = name;
    this.rules = [];
  };

  Drupal.EditorFeature.prototype.addHTMLRule = function (rule) {
    this.rules.push(rule);
  };

  Drupal.FilterStatus = function (name) {
    this.name = name;
    this.active = false;
    this.rules = [];
  };

  Drupal.FilterStatus.prototype.addHTMLRule = function (rule) {
    this.rules.push(rule);
  };

  Drupal.FilterHTMLRule = function () {
    this.tags = [];
    this.allow = null;
    this.restrictedTags = {
      tags: [],
      allowed: {
        attributes: [],
        styles: [],
        classes: []
      },
      forbidden: {
        attributes: [],
        styles: [],
        classes: []
      }
    };
    return this;
  };

  Drupal.FilterHTMLRule.prototype.clone = function () {
    var clone = new Drupal.FilterHTMLRule();
    clone.tags = this.tags.slice(0);
    clone.allow = this.allow;
    clone.restrictedTags.tags = this.restrictedTags.tags.slice(0);
    clone.restrictedTags.allowed.attributes = this.restrictedTags.allowed.attributes.slice(0);
    clone.restrictedTags.allowed.styles = this.restrictedTags.allowed.styles.slice(0);
    clone.restrictedTags.allowed.classes = this.restrictedTags.allowed.classes.slice(0);
    clone.restrictedTags.forbidden.attributes = this.restrictedTags.forbidden.attributes.slice(0);
    clone.restrictedTags.forbidden.styles = this.restrictedTags.forbidden.styles.slice(0);
    clone.restrictedTags.forbidden.classes = this.restrictedTags.forbidden.classes.slice(0);
    return clone;
  };

  Drupal.filterConfiguration = {
    statuses: {},
    liveSettingParsers: {},
    update: function update() {
      Object.keys(Drupal.filterConfiguration.statuses || {}).forEach(function (filterID) {
        Drupal.filterConfiguration.statuses[filterID].active = $("[name=\"filters[".concat(filterID, "][status]\"]")).is(':checked');

        if (Drupal.filterConfiguration.liveSettingParsers[filterID]) {
          Drupal.filterConfiguration.statuses[filterID].rules = Drupal.filterConfiguration.liveSettingParsers[filterID].getRules();
        }
      });
    }
  };
  Drupal.behaviors.initializeFilterConfiguration = {
    attach: function attach(context, settings) {
      once('filter-editor-status', '#filters-status-wrapper input.form-checkbox', context).forEach(function (checkbox) {
        var $checkbox = $(checkbox);
        var nameAttribute = $checkbox.attr('name');
        var filterID = nameAttribute.substring(8, nameAttribute.indexOf(']'));
        Drupal.filterConfiguration.statuses[filterID] = new Drupal.FilterStatus(filterID);
      });
    }
  };
})(jQuery, Drupal, document);