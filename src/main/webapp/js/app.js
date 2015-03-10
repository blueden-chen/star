var app;
app = angular.module('astral', ['classy', 'ngRoute', 'ngSanitize', 'ngAnimate', 'localytics.directives', 'ngTagsInput', 'ui.sortable']);
app.config(function($routeProvider, $locationProvider, $httpProvider) {
	$httpProvider.interceptors.push(function($q, $rootScope, $location) {
		return {
			responseError: function(response) {
				console.log(response);
				if (response.status === 401) {
					$location.url('/?autoSignIn=true');
				}
				return $q.reject(response);
			}
		};
	});
	$locationProvider.html5Mode(true);
	$routeProvider.when('/', {
		templateUrl: 'templates/index.html',
		controller: 'HomeController'
	}).when('/auth', {
		templateUrl: 'templates/index.html',
		controller: 'HomeController'
	}).when('/login', {
		templateUrl: 'templates/index.html',
		controller: 'HomeController'
	}).when('/logout', {
		templateUrl: 'templates/index.html',
		controller: 'HomeController'
	}).when('/dashboard', {
		templateUrl: 'templates/dashboard.html',
		controller: 'DashboardController'
	}).when('/upgrade', {
		templateUrl: 'templates/upgrade.html',
		controller: 'UpgradeController'
	});
	return $routeProvider.otherwise({
		redirectTo: '/'
	});
});
app.run(function($rootScope, $http, CSRF_TOKEN) {
	return $http.defaults.headers.common['Authorization'] = CSRF_TOKEN;
});
app.factory("AuthService", function($http) {
	return {
		requestToken: function() {
			var login;
			return login = $http.get('/api/auth/login');
		},
		login: function(token) {
			var login;
			return login = $http.get("/api/auth/login?code=" + token);
		},
		getUser: function() {
			var user;
			return user = $http.get("/api/auth/user");
		},
		logout: function() {
			var logout;
			return logout = $http.get('/api/auth/logout');
		}
	};
});
app.factory("GitHubService", function($http, $q, $timeout, StarService) {
	return {
		totalPages: 0,
		resStars: [],
		defer: $q.defer(),
		getStarredRepos: function(page) {
			var currentPage, stars;
			if (page == null) {
				page = 1;
			}
			currentPage = page;
			return stars = $http.get("/api/github/stars?page=" + page).then((function(_this) {
				return function(res) {
					if (page === 1) {
						_this.totalPages = $.extend(true, {}, res.data).page_count;
						delete res.data.page_count;
						_this.resStars = _.toArray(res.data);
					} else {
						_this.resStars.push(_.toArray(res.data));
						_this.resStars = [].concat.apply([], _this.resStars);
					}
					currentPage++;
					if (currentPage <= _this.totalPages && _this.totalPages !== 0) {
						$timeout(function() {
							_this.defer.notify(_this.resStars);
							return _this.getStarredRepos(currentPage);
						}, 0);
					} else {
						_this.defer.resolve(_this.resStars);
					}
					return _this.defer.promise;
				};
			})(this));
		},
		getRepoReadme: function(owner, repo) {
			var readme;
			return readme = $http.get("/api/github/repo/" + owner + "/" + repo + "/readme");
		},
		unstarStar: function(star) {
			return star = $http.post('/api/github/unstar', star);
		}
	};
});
app.factory("StarService", function($http, $q) {
	return {
		getStars: function() {
			var stars;
			return stars = $http.get("/api/stars");
		},
		tagStar: function(obj) {
			var s;
			return s = $http.post("/api/star/tag", obj);
		},
		syncTagsToStar: function(star, tags) {
			var s;
			return s = $http.post("/api/star/syncTags", {
				"star": star,
				"tags": tags
			});
		},
		attachTagsToGitHubStars: function(stars, userStars) {
			var defer;
			defer = $q.defer();
			userStars.forEach((function(_this) {
				return function(s) {
					var index;
					index = _.indexOf(stars, _.findWhere(stars, {
						id: parseInt(s.repo_id)
					}));
					if (index !== -1 && _.has(s, "tags")) {
						return stars[index].tags = s.tags;
					}
				};
			})(this));
			defer.resolve(stars);
			return defer.promise;
		},
		buildAutoTagList: function(stars, tags) {
			var autoTagList, defer;
			defer = $q.defer();
			autoTagList = [];
			stars.forEach((function(_this) {
				return function(star) {
					var i, starLang, tagObj;
					if (star.language) {
						starLang = star.language.toLowerCase();
						if (starLang === "coffeescript") {
							starLang = "javascript";
						}
						i = _.indexOf(tags, _.findWhere(tags, function(tag) {
							return tag.name.toLowerCase() === starLang;
						}));
						if (i !== -1) {
							if (_.indexOf(star.tags, _.findWhere(star.tags, function(tag) {
									return tag.name.toLowerCase() === starLang;
								})) === -1) {
								tagObj = {
									"repo_id": star.id,
									"repo_name": star.full_name,
									"tag_id": tags[i].id
								};
								return autoTagList.push(tagObj);
							}
						}
					}
				};
			})(this));
			if (autoTagList.length > 0) {
				this.autoTagStars(autoTagList).then((function(_this) {
					return function(s) {
						return defer.resolve(s);
					};
				})(this));
			} else {
				defer.resolve(null);
			}
			return defer.promise;
		},
		getOccurencesOfTagForStars: function(stars) {
			return $http.post("/api/star/crowdtag", {
				"stars": stars
			});
		},
		buildCrowdTagList: function(stars) {
			var crowdTagList, defer, starMap;
			defer = $q.defer();
			crowdTagList = [];
			starMap = _.map(stars, (function(_this) {
				return function(star) {
					return {
						"name": star.name,
						"id": star.id
					};
				};
			})(this));
			this.getOccurencesOfTagForStars(starMap).then((function(_this) {
				return function(res) {
					return defer.resolve(res);
				};
			})(this));
			return defer.promise;
		},
		autoTagStars: function(stars) {
			return $http.post("/api/star/autotag", stars);
		}
	};
});
app.factory("TagService", function($http, $sanitize) {
	return {
		create: function(name) {
			var tag;
			return tag = $http.post("/api/tags", name);
		},
		fetchAll: function() {
			var tags;
			return tags = $http.get('/api/tags');
		},
		rename: function(id, tag) {
			var tags;
			return tags = $http.put("/api/tags/" + id, tag);
		},
		reorder: function(tagCollection) {
			var i, o, sortHash, tags, _i, _ref;
			sortHash = [];
			for (i = _i = 0, _ref = tagCollection.length - 1; _i <= _ref; i = _i += 1) {
				o = {};
				o["" + tagCollection[i].id] = i;
				sortHash.push(o);
			}
			return tags = $http.post("/api/tags/reorder", {
				"sortHash": sortHash
			});
		},
		"delete": function(id) {
			var tags;
			return tags = $http["delete"]("/api/tags/" + id);
		}
	};
});
app.factory("UserService", function($http) {
	return {
		updateAutotag: function(bool) {
			return $http.post("/api/user/settings/autotag", {
				checked: bool
			});
		},
		updateCrowdtag: function(bool) {
			return $http.post("/api/user/settings/crowdtag", {
				checked: bool
			});
		},
		exportData: function() {
			return $http.get("/api/user/settings/exportData");
		}
	};
});
app.classy.controller({
	name: 'DashboardController',
	inject: ['$rootScope', '$scope', '$location', '$routeParams', '$sce', '$timeout', '$http', 'GitHubService', 'StarService', 'TagService', 'UserService', 'AuthService'],
	init: function() {
		this.$.flash = {
			"message": null,
			"type": "success",
			"active": false
		};
		this.$.loadingStatus = {
			"message": null,
			"active": false
		};
		this.$.exportingData = false;
		this.$.stars = [];
		this.$.totalPages = 0;
		this.$.userStars = [];
		this.$.currentStar = null;
		this.$.tags = [];
		this.$.currentTag = null;
		this.$.currentStarTags = [];
		this.$.addingTag = false;
		this.$.addingTags = false;
		this.$.newTag = {
			"name": ""
		};
		this.$.readme = null;
		this.$.readmeLoading = false;
		this.$.untaggedFilter = false;
		this.$.repoSearchText = "";
		this.$.userSettings = {
			"active": false
		};
		this.AuthService.getUser().then((function(_this) {
			return function(user) {
				_this.$rootScope.user = user.data;
				return _this.$timeout(function() {
					_this.$.getStars();
					_this.$.getUserStars();
					return _this.$.getTags();
				}, 0);
			};
		})(this));
		return this.$.sortableOptions = {
			update: (function(_this) {
				return function(e, ui) {
					return _this.$timeout(function() {
						return _this.TagService.reorder(_this.$.tags).success(function(tags) {
							return this.$.tags = tags;
						});
					}, 0);
				};
			})(this)
		};
	},
	showFlash: function(msg, type, duration) {
		var timer;
		if (type == null) {
			type = "success";
		}
		if (duration == null) {
			duration = 4250;
		}
		this.$.flash = {
			"message": msg,
			"type": type,
			"active": true
		};
		if (duration !== -1) {
			return timer = this.$timeout((function(_this) {
				return function() {
					return _this.$.hideFlash();
				};
			})(this), duration);
		}
	},
	hideFlash: function() {
		return this.$.flash.active = false;
	},
	showUserSettings: function() {
		return this.$.userSettings.active = true;
	},
	hideUserSettings: function() {
		return this.$.userSettings.active = false;
	},
	showUpgradeView: function() {
		return this.$.userSettings.upgradeView = true;
	},
	hideUpgradeView: function() {
		return this.$.userSettings.upgradeView = false;
	},
	setLoadingStatus: function(status) {
		this.$.loadingStatus.message = status;
		return this.$.loadingStatus.active = true;
	},
	hideLoadingStatus: function() {
		return this.$.loadingStatus.active = false;
	},
	getStars: function() {
		this.$.setLoadingStatus("Loading Stars...");
		return this.GitHubService.getStarredRepos().then(((function(_this) {
			return function(stars) {
				_this.$.stars = stars;
				_this.$.attachTagsToGitHubStars();
				if (_this.$rootScope.user.autotag) {
					_this.$.setLoadingStatus("Auto-tagging Stars...");
					return _this.StarService.buildAutoTagList(stars, _this.$.tags).then(function(s) {
						_this.$.hideLoadingStatus();
						if (s !== null) {
							_this.$.userStars = s.data;
							return _this.$timeout(function() {
								_this.$.getTags();
								_this.$.attachTagsToGitHubStars();
								if (_this.$rootScope.user.crowdtag) {
									_this.$.setLoadingStatus("Crowd-tagging Stars...");
									return _this.StarService.buildCrowdTagList(stars).then(function(s2) {
										_this.$.hideLoadingStatus();
										if (s2 !== null) {
											_this.$.userStars = s2.data;
											_this.$.getTags();
											return _this.$.attachTagsToGitHubStars();
										}
									});
								} else {
									return _this.$.hideLoadingStatus();
								}
							}, 0);
						}
					});
				} else {
					if (_this.$rootScope.user.crowdtag) {
						_this.$.setLoadingStatus("Crowd-tagging Stars...");
						return _this.StarService.buildCrowdTagList(stars).then(function(s2) {
							_this.$.hideLoadingStatus();
							if (s2 !== null) {
								_this.$.userStars = s2.data;
								_this.$.getTags();
								return _this.$.attachTagsToGitHubStars();
							}
						});
					} else {
						return _this.$.hideLoadingStatus();
					}
				}
			};
		})(this)), ((function(_this) {
			return function(error) {
				return _this.$.showFlash('Error retrieving stars', 'error');
			};
		})(this)), (function(_this) {
			return function(resStars) {
				_this.$.stars = resStars;
				return _this.$.attachTagsToGitHubStars();
			};
		})(this));
	},
	setCurrentStar: function(star) {
		this.$.currentStar = star;
		this.$.getRepoReadme(star.owner.login, star.name);
		return this.$.getTagsForCurrentStar();
	},
	getUserStars: function(attachTags) {
		if (attachTags == null) {
			attachTags = false;
		}
		return this.StarService.getStars().success((function(_this) {
			return function(stars) {
				_this.$.userStars = stars;
				if (attachTags) {
					return _this.$timeout(function() {
						return _this.$.attachTagsToGitHubStars();
					}, 0);
				}
			};
		})(this));
	},
	unstarStar: function(index) {
		return this.GitHubService.unstarStar(this.$.currentStar).success((function(_this) {
			return function(res) {
				_this.$.userStars = res;
				_this.$.getTags();
				_this.$.stars.splice(index, 1);
				_this.$.currentStar = null;
				_this.$.readme = null;
				return _this.$scope.$apply();
			};
		})(this));
	},
	setCurrentTag: function(tag) {
		this.$.untaggedFilter = false;
		if (tag) {
			return this.$.currentTag = tag;
		} else {
			return this.$.currentTag = null;
		}
	},
	updateCurrentTagName: function() {
		if (this.$.currentTag.name) {
			return this.TagService.rename(this.$.currentTag.id, this.$.currentTag).success((function(_this) {
				return function(tags) {
					_this.$.tags = tags;
					_this.$.getTagsForCurrentStar();
					return _this.$.showFlash("Tag renamed to " + _this.$.currentTag.name);
				};
			})(this));
		} else {
			return this.$.showFlash("Tag name cannot be blank.", "error");
		}
	},
	deleteCurrentTag: function() {
		var tagName;
		tagName = this.$.currentTag.name;
		return this.TagService["delete"](this.$.currentTag.id).success((function(_this) {
			return function(tags) {
				_this.$.tags = tags;
				_this.$.currentTag = null;
				_this.$.getUserStars(true);
				return _this.$.showFlash("" + tagName + " was deleted");
			};
		})(this));
	},
	getRepoReadme: function(owner, repo) {
		this.$.readmeLoading = true;
		return this.GitHubService.getRepoReadme(owner, repo).success((function(_this) {
			return function(res) {
				_this.$.readmeLoading = false;
				_this.$.readme = _this.$sce.trustAsHtml(res.readme);
				return $('.dashboard-repo-details').scrollTop(0);
			};
		})(this)).error((function(_this) {
			return function(err) {
				_this.$.readme = null;
				return _this.$.readmeLoading = false;
			};
		})(this));
	},
	toggleSidebarTagEditor: function() {
		return this.$.addingTag = !this.$.addingTag;
	},
	getTags: function() {
		return this.TagService.fetchAll().success((function(_this) {
			return function(tags) {
				_this.$.tags = tags;
				return window.tagz = _this.$.tags;
			};
		})(this));
	},
	getTagsForCurrentStar: function() {
		var clonedStar;
		this.$.currentStarTags = [];
		clonedStar = $.extend(true, {}, this.$.currentStar);
		return this.$.currentStarTags = clonedStar.tags;
	},
	fetchTagsForAutoComplete: function(query) {
		return this.$http.get("/api/tags?query=" + query);
	},
	addTag: function() {
		if (this.$.newTag.name) {
			return this.TagService.create(this.$.newTag).success((function(_this) {
				return function(tag) {
					_this.$.tags.push(tag);
					_this.$.showFlash("" + tag.name + " created successfully");
					return _this.$.newTag.name = "";
				};
			})(this));
		} else {
			return this.$.showFlash("Tag name cannot be blank.", "error");
		}
	},
	tagStar: function(star, tagId, showNotification) {
		var obj;
		if (showNotification == null) {
			showNotification = true;
		}
		obj = {
			"repo_id": star.id,
			"repo_name": star.full_name,
			"tag_id": tagId
		};
		return this.StarService.tagStar(obj).success((function(_this) {
			return function(tags) {
				var tag, tagName;
				_this.$.tags = tags;
				_this.$.getUserStars(true);
				tag = _.findWhere(_this.$.tags, {
					id: parseInt(tagId)
				});
				tagName = tag.name;
				if (showNotification) {
					return _this.$.showFlash("" + star.full_name + " added to " + tagName);
				}
			};
		})(this));
	},
	syncTagsToStar: function() {
		var star;
		star = this.$.currentStar;
		return this.StarService.syncTagsToStar(star, this.$.currentStarTags).success((function(_this) {
			return function(stars) {
				_this.$.userStars = stars;
				_this.$.getTags();
				_this.$.toggleTagEditor();
				return _this.$timeout(function() {
					return _this.$.attachTagsToGitHubStars();
				}, 0);
			};
		})(this));
	},
	sortTags: function(sorter) {
		if (sorter === "alpha") {
			this.$.tags = _.sortBy(this.$.tags, (function(_this) {
				return function(tag) {
					return tag.name.toLowerCase();
				};
			})(this));
		} else {
			this.$.tags = _.sortBy(this.$.tags, (function(_this) {
				return function(tag) {
					return tag.stars.length * -1;
				};
			})(this));
		}
		return this.$timeout((function(_this) {
			return function() {
				return _this.TagService.reorder(_this.$.tags).success(function(tags) {
					return this.$.tags = tags;
				});
			};
		})(this), 0);
	},
	attachTagsToGitHubStars: function() {
		return this.StarService.attachTagsToGitHubStars(this.$.stars, this.$.userStars).then((function(_this) {
			return function(stars) {
				_this.$.stars = stars;
				_this.$.getTagsForCurrentStar();
				return window.starz = _this.$.stars;
			};
		})(this));
	},
	starHasCurrentTag: function(star) {
		var found, tagArray;
		found = false;
		tagArray = [];
		if (this.$.currentTag) {
			_.forEach(star.tags, (function(_this) {
				return function(tag) {
					if (tag.name === _this.$.currentTag.name) {
						return found = true;
					}
				};
			})(this));
		} else {
			found = true;
		}
		return found;
	},
	filterByUntagged: function() {
		this.$.currentTag = null;
		return this.$.untaggedFilter = true;
	},
	repoSearch: function(star) {
		var searchArray, searchString, starHasTags, stringMatch, tagMatches, tags;
		if (this.$.repoSearchText[0] === "#" && this.$.repoSearchText.indexOf(":") === -1) {
			return _.findIndex(star.tags, (function(_this) {
				return function(tag) {
					return tag.name.toLowerCase().indexOf(_this.$.repoSearchText.replace('#', '').toLowerCase()) > -1;
				};
			})(this)) > -1;
		}
		searchArray = this.$.repoSearchText.split(':');
		tagMatches = _.filter(searchArray, function(i) {
			return i[0] === "#";
		});
		stringMatch = _.filter(searchArray, function(i) {
			return i[0] !== "#";
		}).join(':').toLowerCase();
		if (tagMatches.length > 0) {
			tags = _.map(tagMatches, function(tag) {
				return tag.replace('#', '').toLowerCase();
			});
			starHasTags = _.filter(star.tags, function(t) {
				return _.contains(tags, t.name.toLowerCase());
			}).length === tags.length;
			if (star.description) {
				searchString = "" + (star.full_name.toLowerCase()) + " " + (star.description.toLowerCase());
			} else {
				searchString = star.full_name.toLowerCase();
			}
			return starHasTags && searchString.indexOf(stringMatch) > -1;
		} else {
			if ((this.$.repoSearchText == null) || this.$.repoSearchText.replace(/\s/g, "") === "") {
				return true;
			} else {
				if (star.description) {
					searchString = "" + (star.full_name.toLowerCase()) + " " + (star.description.toLowerCase());
				} else {
					searchString = star.full_name.toLowerCase();
				}
				return searchString.indexOf(this.$.repoSearchText.toLowerCase()) > -1;
			}
		}
	},
	untagged: function(star) {
		if (!this.$.currentTag && this.$.untaggedFilter) {
			return !star.hasOwnProperty('tags');
		} else {
			return true;
		}
	},
	toggleTagEditor: function() {
		return this.$.addingTags = !this.$.addingTags;
	},
	updateAutotagSetting: function(bool) {
		var checked;
		checked = bool;
		return this.UserService.updateAutotag(checked).then((function(_this) {
			return function(res) {
				return _this.$rootScope.user = res.data;
			};
		})(this));
	},
	updateCrowdtagSetting: function(bool) {
		var checked;
		checked = bool;
		return this.UserService.updateCrowdtag(checked).then((function(_this) {
			return function(res) {
				return _this.$rootScope.user = res.data;
			};
		})(this));
	},
	exportData: function() {
		this.$.exportingData = true;
		return window.location = "/api/user/settings/exportData";
	},
	watch: {
		'{object}currentTag': function(newValue, oldValue) {
			var taggedStars;
			if (this.$.currentTag) {
				if (newValue.name === "") {
					newValue.name = "Unnamed Tag";
				}
				if (newValue && oldValue) {
					if (newValue.id === oldValue.id && newValue.name !== oldValue.name) {
						taggedStars = _.filter(this.$.stars, function(star) {
							return _.where(star.tags, {
								name: oldValue.name
							}).length > 0;
						});
						return taggedStars.forEach((function(_this) {
							return function(star) {
								var index, tagIndex;
								index = _.indexOf(_this.$.stars, _.findWhere(_this.$.stars, {
									id: star.id
								}));
								tagIndex = _.indexOf(_this.$.stars[index].tags, _.findWhere(_this.$.stars[index].tags, {
									name: oldValue.name
								}));
								return _this.$.stars[index].tags[tagIndex].name = newValue.name;
							};
						})(this));
					}
				}
			}
		}
	}
});
app.classy.controller({
	name: 'HomeController',
	inject: ['$rootScope', '$scope', '$location', '$routeParams', 'AuthService'],
	init: function() {

		this.$.user = null;
		this.$.token = this.$routeParams.code;
		this.$.authError = this.$routeParams.error;
		this.$.autoSignIn = this.$routeParams.autoSignIn;
		this.$.loggingIn = false;
		this.$.authError = {
			show: false,
			message: ""
		};
		if (this.$.autoSignIn) {
			this.$.requestToken();
		}
		if (this.$location.path() === '/auth') {
			this.$.loggingIn = true;
			if (this.$.token) {
				this.$.login(this.$.token);
			} else if (this.$.authError) {
				console.log("Authentication Error");
			}
		}
		if (this.$location.path() === '/logout') {
			return this.$.logout();
		}
	},
	requestToken: function() {
		this.$.loggingIn = true;
		return this.AuthService.requestToken().success((function(_this) {
			return function(res) {
				return window.location.href = res.authUrl;
			};
		})(this));
	},
	login: function(token) {
		return this.AuthService.login(token).success((function(_this) {
			return function(user) {
                console.log(user)
				_this.$rootScope.user = user;
				return _this.$location.url('/dashboard');
			};
		})(this)).error((function(_this) {
			return function(data, status, headers, config) {
				_this.$.loggingIn = false;
				_this.$.authError.message = data.error;
				return _this.$.authError.show = true;
			};
		})(this));
	},
	logout: function() {
		return this.AuthService.logout().success((function(_this) {
			return function() {
				_this.$rootScope.user = null;
				return _this.$location.url('/');
			};
		})(this));
	}
});
app.classy.controller({
	name: 'UpgradeController',
	inject: ['$rootScope', '$scope', '$location', '$routeParams', '$sce', '$timeout', '$http', 'UserService', 'AuthService'],
	init: function() {
		return console.log("Init");
	}
});
app.directive('closeonescape', ["$timeout", function(timer) {
	return {
		restrict: "A",
		replace: false,
		scope: true,
		link: function(scope, element, attrs) {
			var hideModal;
			$('body').on("keyup", function(e) {
				if (e.keyCode === 27) {
					e.preventDefault();
					return timer(hideModal, 0);
				}
			});
			return hideModal = function() {
				return scope.hideUserSettings();
			};
		}
	};
}]);
app.directive('ccform', function() {
	return {
		restrict: 'A',
		link: function($scope, element, attrs) {
			var $ccCVC, $ccExpDate, $ccNumber;
			$ccNumber = $(element).find('.cc-number');
			$ccExpDate = $(element).find('.cc-exp-date');
			$ccCVC = $(element).find('.cc-cvc');
			$ccNumber.payment('formatCardNumber');
			$ccExpDate.payment('formatCardExpiry');
			$ccCVC.payment('formatCardCVC');
			return element.on("submit", (function(_this) {
				return function() {
					var ccErrors, expDate, expMonth, expYear;
					expDate = $ccExpDate.payment('cardExpiryVal');
					expMonth = expDate["month"].toString();
					expYear = expDate["year"].toString();
					console.log($ccNumber.val().toString());
					$scope.userSettings.ccErrors = [];
					ccErrors = [];
					if (!$.payment.validateCardNumber($ccNumber.val())) {
						ccErrors.push("Invalid card number");
					}
					if (!$.payment.validateCardExpiry(expMonth, expYear)) {
						ccErrors.push("Invalid expiry");
					}
					if (!$.payment.validateCardCVC($ccCVC.val())) {
						ccErrors.push("Invalid CVC");
					}
					$scope.userSettings.ccErrors = ccErrors;
					return $scope.$apply();
				};
			})(this));
		}
	};
});
app.directive('draggable', function() {
	return {
		restrict: 'C',
		scope: true,
		replace: false,
		link: function(scope, elem, attrs) {
			return elem[0].addEventListener('dragstart', function(e) {
				var star;
				star = $(elem).data().$scope.$parent.star;
				return e.dataTransfer.setData("Text", JSON.stringify(star));
			}, false);
		}
	};
});
app.directive('droppable', function() {
	return {
		restrict: 'C',
		scope: true,
		replace: false,
		link: function(scope, elem, attrs) {
			elem[0].addEventListener('dragover', function(e) {
				e.preventDefault();
				return $(e.target).addClass('dragging');
			}, false);
			elem[0].addEventListener('dragleave', function(e) {
				return $(e.target).removeClass('dragging');
			}, false);
			elem[0].addEventListener('dragend', function(e) {
				return $(e.target).removeClass('dragging');
			}, false);
			return elem[0].addEventListener('drop', function(e) {
				var currentStar;
				$(e.target).removeClass('dragging');
				currentStar = JSON.parse(e.dataTransfer.getData("Text"));
				return scope.tagStar(currentStar, $(e.target).attr('data-tag-id'));
			}, false);
		}
	};
});
app.directive('dropdown', function() {
	return {
		restrict: 'A',
		replace: false,
		link: function($scope, element, attrs) {
			$('html').on('click', function(e) {
				return $('[dropdown]').removeClass('dropdown-active');
			});
			element.on('click', function(e) {
				if ($(e.target).parents('[dropdown]').length) {
					e.stopPropagation();
				}
				if (e.target.hasAttribute('dropdown')) {
					e.preventDefault();
					e.stopPropagation();
					return $(this).toggleClass('dropdown-active');
				}
			});
			return element.find('[close-dropdown]').on('click', function(e) {
				return $(this).parents('[dropdown]').removeClass('dropdown-active');
			});
		}
	};
});
app.directive('textselect', function() {
	return {
		restrict: 'A',
		link: function($scope, element, attrs) {
			return element.on('click', function(e) {
				return setTimeout((function(_this) {
					return function() {
						return $(_this).focus().select();
					};
				})(this), 0);
			});
		}
	};
});
app.directive('syntax', ['$timeout', function(timer) {
	return {
		restrict: 'C',
		scope: true,
		link: function(scope, elem, attrs) {
			var doHighlight;
			scope.$watch('readme', function(newVal) {
				if (newVal) {
					return timer(doHighlight, 0);
				}
			});
			doHighlight = function() {
				elem.find('pre').addClass('prettyprint');
				return prettyPrint();
			};
			return timer(doHighlight, 0);
		}
	};
}]);
app.directive('setFocusIf', ['$timeout', function(timer) {
	return {
		restrict: 'A',
		link: function($scope, element, attr) {
			return $scope.$watch(attr.setFocusIf, function(val) {
				if (val) {
					return timer(function() {
						if ($scope.$eval(attr.setFocusIf)) {
							return $(element).find("input").focus();
						}
					}, 0, false);
				}
			});
		}
	};
}]);
app.directive('spinner', function() {
	return {
		restrict: 'E',
		template: '<div class="loader"></div>',
		replace: true,
		link: function($scope, element, attrs) {
			var opts, spinner;
			opts = {
				lines: 13,
				length: 2,
				width: 2,
				radius: 5,
				corners: 1,
				rotate: 0,
				direction: 1,
				color: attrs.color,
				speed: 1,
				trail: 60,
				shadow: false,
				hwaccel: true,
				className: 'spinner',
				zIndex: 98,
				top: attrs.top || '50%',
				left: attrs.left || '50%'
			};
			return spinner = new Spinner(opts).spin($(element)[0]);
		}
	};
});
app.directive('switch', function() {
	return {
		restrict: 'E',
		template: '<div class="switch"><input type="checkbox" id="{{id}}" ng-transclude></input><label for="{{id}}" ng-transclude></label></div>',
		replace: true,
		transclude: true,
		scope: {
			id: "@"
		},
		link: function($scope, element, attrs) {
			var checkedExpr;
			$scope.$watch('$root.user', function(newVal) {
				var checkedExpr;
				if (newVal) {
					checkedExpr = $scope.$parent.$eval(attrs.checked);
					if (checkedExpr) {
						return element.children('input[type=checkbox]').attr('checked', 'checked');
					}
				}
			});
			element.removeAttr('id checked change');
			checkedExpr = $scope.$parent.$eval(attrs.checked);
			if (checkedExpr) {
				element.children('input[type=checkbox]').attr('checked', 'checked');
			}
			return element.children('input[type=checkbox]').on("change", (function(_this) {
				return function(e) {
					if (attrs.change) {
						return $scope.$parent.$eval(attrs.change);
					}
				};
			})(this));
		}
	};
});
app.directive('triggerOnEnter', ['$timeout', function(timer) {
	return {
		restrict: 'A',
		link: function($scope, element, attr) {
			return $(document).keydown((function(_this) {
				return function(e) {
					return timer(function() {
						if ($scope.$eval(attr.triggerOnEnter) && e.keyCode === 13) {
							return $(element).trigger("click");
						}
					}, 0, false);
				};
			})(this));
		}
	};
}]);