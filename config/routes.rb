Rails.application.routes.draw do
  # Public routes
  root "home#index"
  get "about", to: "home#about"
  post "contact", to: "home#contact"
  get "contact", to: "home#contact"

  resources :articles, only: [ :index, :show ] do
    collection do
      get :search
    end
  end

  # Authentication routes
  resource :session
  resources :passwords, param: :token

  # Admin routes
  namespace :admin do
    root "articles#index"

    resources :articles do
      collection do
        get :search
        get :stats
      end
      member do
        patch :toggle_status
        patch :archive
        patch :autosave
      end
    end

    resource :settings, only: [ :show, :update ]
  end

  # API routes for async operations
  namespace :api do
    namespace :admin do
      resources :articles, only: [ :create, :update, :destroy ] do
        member do
          patch :autosave
        end
      end
    end
  end

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker
end
