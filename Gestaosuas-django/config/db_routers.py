APP_DATA_MODELS = {
    ("directorates", "directorate"),
    ("directorates", "monthlysubmission"),
    ("directorates", "dailyreport"),
    ("directorates", "monthlyreport"),
    ("directorates", "osc"),
    ("directorates", "workplan"),
    ("directorates", "visit"),
    ("directorates", "formdelegation"),
    ("monitoramento", "beneficiosreport"),
    ("monitoramento", "naicareport"),
    ("monitoramento", "sinereport"),
    ("monitoramento", "qualificacaoreport"),
    ("monitoramento", "genericmonitoringreport"),
    ("cras", "crasreport"),
    ("beneficios", "beneficiosreport"),
    ("sinecp", "sinereport"),
    ("sinecp", "qualificacaoreport"),
    ("naica", "naicareport"),
    ("core", "activitylog"),
    ("core", "mapcategory"),
    ("core", "mapunit"),
    ("core", "systemsetting"),
}


class AppDataRouter:
    app_data_alias = "app_data"

    def _is_app_data_model(self, model):
        return (model._meta.app_label, model._meta.model_name) in APP_DATA_MODELS

    def db_for_read(self, model, **hints):
        if self._is_app_data_model(model):
            return self.app_data_alias
        return None

    def db_for_write(self, model, **hints):
        if self._is_app_data_model(model):
            return self.app_data_alias
        return None

    def allow_relation(self, obj1, obj2, **hints):
        if self._is_app_data_model(obj1.__class__) or self._is_app_data_model(obj2.__class__):
            return True
        return None

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        key = (app_label, model_name)
        if key in APP_DATA_MODELS:
            return db == self.app_data_alias
        if db == self.app_data_alias:
            return False
        return None
